+++
title = 'Getting Started With Stratoshark'
date = 2025-01-07T15:28:55-08:00
draft = false
tags=["stratoshark"]
+++

## Introduction

Stratoshark is the newest piece of software coming from the Wireshark Foundation. For experienced network analysts like me, it promises to be a familiar interface and filtering engine for unfamiliar domains like cloud and system call internals.

In particular, I'm really excited to be able to analyze system calls on Linux systems. This post summarizes what I've learned about how to set up a lab environment, install Stratoshark, and begin some analysis.

## What are System Calls?

In a computer, you have applications. Applications include web browsers, email clients, music players, word processors, and whatever else you have installed. These applications need to access things outside of the computer: web browsers need to access the network, music players need to access sound devices, and word processors need to access hard drives and USB drives. However, none of those applications know how to do that.

The operating system (OS) is what knows how to do that. It knows how to differentiate a WiFi connection from Ethernet, a Bluetooth headset from a speaker plugged into the 3.5mm jack, and an NVMe drive from a SATA drive. And crucially, it makes sure that the applications don't need to know the difference.

In order to make that work, the OS implements a standard set of functions that applications can use to interact with all those other devices. These are largely really simple functions like `read()`, `write()`, `socket()`, and `sendmsg()`. And these functions are called system calls.

So if we have a way to look at the system calls a program is making, we can see everything it's trying to do. We can see all the network communication, all the files it wants to access, all the sounds it wants to play, and all sorts of other things.

## How Can We Capture System Calls?

In Linux, there's an open source tool called `sysdig` that functions quite a bit like `tcpdump` does for packet captures. It's available on [Github](https://github.com/draios/sysdig) and comes with a pretty comprehensive set of documentation.

All we need to do is install `sysdig` on our target server and run it to collect system call captures. Then we can open the capture file with Stratoshark and start poking around.

## Installing Sysdig

I'm installing `sysdig` on a Raspberry Pi, but the instructions work for any Linux system.

1. Determine the CPU architecture of the target system. You can do this by running `uname -a` in the terminal. Mine is a 64 bit ARM system
```
pi@lab:~ $ uname -a
Linux lab 6.6.20+rpt-rpi-v8 #1 SMP PREEMPT Debian 1:6.6.20-1+rpt1 (2024-03-07) aarch64 GNU/Linux
```
2. Go to the [sysdig releases page](https://github.com/draios/sysdig/releases) on Github and copy the link for your architecture of choice. I'm using the `*aarch64.deb` file.
3. On the target system, use `wget` to download the file.
```
wget https://github.com/draios/sysdig/releases/download/0.39.0/sysdig-0.39.0-aarch64.deb
```
4. Use apt (or your distro's package manager) to install the package.
```
apt install sysdig-0.39.0-aarch64.deb
```
5. Run `sysdig --version` to validate the installation was successful.
```
pi@lab:~ $ sysdig --version
sysdig version 0.39.0
```

## Installing Stratoshark

**Updated Jan 2025**

The Stratoshark installer is now available from [stratoshark.com](https://stratoshark.org/).

On the Downloads section of the web page, click the link for your appropriate platform.

From there, installation is just like Wireshark. Since I use a Mac, I double-click the `.dmg` file and install Stratoshark.

## A Brief Guide to Sysdig Captures

### Creating a First Capture

Sysdig can be run without any options to get a wide open capture of all the system calls on a computer, including the ones sysdig is making.

```
sysdig -w capture.scap
```
This command will capture everything and save it to `capture.scap`. 

### Seeing More Payload Data

The default behavior for tcpdump is to record the entire payload of every packet. If you want to decrease the file size, you need to adjust the snap length of the capture to only record partial packets.

Sysdig, on the other hand, defaults to only recording 80 bytes of payload. You can modify this with the `-s` flag. There doesn't appear to be a way to run sysdig without a limit on payload sizes.

```
sysdig -s 1000 -w capture.scap
```
Capture the first 1000 bytes of payload of every system call and save the results to `capture.scap`. 

### Focusing on Just a Couple Processes

Filtering in sysdig functions a little more like `tshark` than `tcpdump`. The syntax is more similar to a display filter than a capture filter. If I want to look at only nginx system calls, I'd use:

```
sysdig -w capture.scap proc.name=nginx
```

You can also look at multiple processes:

```
sysdig -w capture.scap proc.name=nginx or proc.name=python3
```

### Focusing on Specific System Calls

You can also focus on specific system call types. If you want to look at only files getting opened:

```
sysdig -w capture.scap evt.type=open
```

### Finding other Kinds of Filters

Sysdig has a built-in repository of all the included filters.

```
sysdig -l
```

### Analyzing scap files with Stratoshark

Once you open one of those `scap` files in Stratoshark, you'll see a very familiar interface. The biggest difference you come across is the event details pane (packet details in Wireshark).

This pane has a completely different set of expanding headers. I've found these to be the most useful:

- System Event - this header is the equivalent of the Wireshark "Frame" header
	- Arrival time - the timestamp of the event
- Event Information - this header contains the most crucial information for analysis
	- Direction - a right-facing carat (>) indicates a call from an application to the OS (a request), and a left-facing carat (<) indicates a response from the OS
	- Type - the name of the system call function being called
	- Arguments - this may or may not show up, depending on the function being called. If it does show up, it displays the specific request or response values of the call
- Process Information - information about the process sending or receiving the syscall
	- Name - the name of the process
	- Parent Name - the name of the process that created the process. For example, a system running Apache will often have Name = kworker and Parent Name = apache
	- Process ID - This is equivalent to the PID you would find using `netstat` or `top`. This can help integrate with data from other tools.
- File Descriptor Information - if shown, this contains details of the file the process is trying to interact with
	- FD Name - in Linux, almost everything is a file, including network sockets

### Getting More Information About Individual Calls

As I learn more about troubleshooting with Stratoshark, the biggest issue I run into is that there are hundreds of system calls, and I don't know what they all do.

I've found that [the man pages](https://www.man7.org/linux/man-pages/man2/syscalls.2.html) have a fantastic reference. I can search that page for the event type and get a description of what it does, what the request and response objects are, and how it works under the hood.

## Summary

Learning how to use Stratoshark is an ongoing process, and I'm sure that my understanding is going to be far better in a few months. But I don't want to wait a few months to start getting other smart people looking at scap files. I hope that this post will remain a useful reference guide as you begin learning Stratoshark and system call analysis.h