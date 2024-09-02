+++
title = "An Argument for Increasing TCP's Initial Congestion Window ... Again"
date = 2024-09-02T11:07:16-04:00
draft = false
tags = ["performance"]
+++

## Introduction

Google has a long history of performing networking research, making changes, and pushing those changes to the entire internet. In 2011, they published [one of my favorite papers](https://research.google/pubs/an-argument-for-increasing-tcps-initial-congestion-window/), which described their decision to increase the TCP initial congestion window from 1 to 10 on their entire infrastructure. This was soon followed by an [RFC filed with the IETF](https://www.rfc-editor.org/rfc/rfc6928), and eventually became an internet standard.

I think it's time to revisit that paper and update Google's recommendations for the modern Internet.

## TCP Initial Congestion Window

TCP uses an idea called the sliding window to manage how much data is in transit on the network at any given time. The receiver manages a receive window that tells the sender how much data it is willing to receive at once. In modern TCP, the receive window is set very high and only reduces if the receiver is running out of capacity. The goal is to ensure the receiver is never limiting the data transfer speed with a low window.

At the same time, the sender manages something called a congestion window. This value is the number of packets the sender can send at one time before it needs to pause and wait for a response from the receiver. There are various congestion control algorithms that adjust the congestion window, but the general goal of all of them is to ramp up transmission until it's as fast as possible without being affected by congestion or packet loss somewhere in the network.

These congestion control algorithms require a seed value at the start of a transmission known as the initial congestion window. This value determines how much data can be sent at the beginning of a connection.

In traditional TCP (pre-2010), that value was set anywhere between 1 and 3, depending on OS and software. The predominant congestion control algorithm at that time, TCP New Reno, would increase the congestion window by an initial congestion window for every round trip with no packet loss. So a successful connection with no loss would look something like this:

1. Initial congestion window: 2. 2 packets sent (3 KB).
2. Congestion window: 4. 6 KB sent.
3. Congestion window: 6. 9 KB sent.

And so on...

If that connection runs into some packet loss, that congestion window is then cut in half and has to slowly recover. Eventually, in a long connection, the congestion window will settle in to a relatively narrow set of values, and this steady state condition is called convergence.

This scheme makes sense for the network traffic TCP was designed for. Large file transfers are minimally affected by this initial ramp up period. Depending on the round trip time of the connection, convergence can occur within 1 or 2 seconds, which isn't too long for a file transfer that's expected to take several minutes.

However, this convergence period has an adverse affect on the predominant communication on the internet: web page loads and API calls.

## HTTP over TCP

Both web page loads and API calls use HTTP(s), and in the late 2000's, they always used TCP as the transport layer.

A typical HTTP request looks like this on the network:

1. TCP connection is established
2. TLS encryption is established
3. Client sends an HTTP request (anywhere from 20 - 8000 bytes)
4. Server sends an HTTP response (anywhere from 100 bytes - 10 MB)

Crucially, the statistical distribution of both request and response sizes skews towards the higher end of those ranges. I'm certainly not the first person to say that the internet is bloated.

When TCP's initial congestion window is set to something like 2, the largest request or response that can be sent in a single round trip is 3 KB. And in 2011, that was only about 40% of responses on the internet. That means 60% of assets that had to load for a web page to render had to wait at least an extra round trip to fully download. For typical internet round trips, that's an extra 30ms for each of the 60+ assets that might be more than 3 KB. That means this web page will take an extra 1.2 seconds to load.

## Google's original recommendation

Because of that data, Google chose to increase the initial congestion window on their infrastructure to 10, a round trip data cutoff of 15 KB. Their calculations showed that this would allow nearly 85% of assets being served to users to load in a single round trip. 

However, this doesn't hold true on the 2020s internet. The use of both Javascript and images has skyrocketed, so the initial page loads on websites on modern websites consist of hundreds of assets, most of them 100s of KB in size. The increased bloat of the modern internet is causing us to run into the same problem again.

## What Should We Do Now?

The challenge we face now is that just increasing the initial congestion window by another order of magnitude could be counterproductive. If web servers all over the internet start blasting out 100s of packets at a time, we will just be causing the congestion and packet loss that TCP tries to avoid. Just about everywhere, storage is cheap, but bandwidth is expensive. Because of that, there are a lot of network devices out there connected to low bandwidth links with lots of storage. This means that these devices have deep buffers. A packet trying to exit a low bandwidth link could be stuck waiting in that buffer for a long time before it makes it back onto the network.

Imagine a home network setup where the internet upload speed is 10 Mbps, but the connection between the router and someone's computer is 1 Gbps. If the computer tries to send something at 1 Gbps, those packets are just going to back up on the router while they come out the other end at 10 Mbps. 

This problem is called bufferbloat, and it's one of the main reasons a slow increase of the congestion window exists.

Luckily, another Google invention comes to the rescue. Google developed a congestion control algorithm called [BBR](https://dl.acm.org/doi/pdf/10.1145/3009824) that works completely differently from every other algorithm in use. Most algorithms look for signs of packet loss as a signal to reduce the congestion window. In developing BBR, Google makes the assumption that packet loss is transient. The existence of packet loss right now is not an accurate predictor for packet loss 20 ms from now. However, congestion due to bufferbloat is much more predictable.

So BBR mostly ignores packet loss in favor for closely monitoring signs of congestion. When packets are stuck in a buffer in some network device somewhere, they take longer to get to the destination. That means the responses to those packets will also be delayed. BBR looks at the variance in round trip time in a connection and uses that to identify congestion. If there is congestion, then the congestion window is reduced.

So, to make TCP performant for the modern internet, we need to do a couple things:

- Increase the initial congestion window to a higher reasonable number (my sense is that number should be between 20 and 40)
- Adopt BBR as the default congestion control algorithm for web servers and API servers.

## What about QUIC?

I'll admit there's some incongruity in my post here. Why am I making it instead of Google?

The answer is pretty simple: Google has largely pivoted away from TCP. Google also developed QUIC, which is HTTP over UDP. There's no longer any congestion window to deal with, so entire messages can be sent at once. And most of the time, if there's any packet loss, it's faster to retransmit the entire message instead of waiting for TCP to start transmitting at a decent rate.

However, I don't think that QUIC means we can ignore TCP tuning. For one, enterprises largely disable QUIC and force websites like Google to downgrade back to TCP. This is because there's only a single firewall vendor that can decrypt and inspect QUIC traffic (Go Fortinet!). Every other vendor provides a setting to disable QUIC support on the entire network. And second, there's always legacy equipment that doesn't support modern protocols. By tuning TCP better, we can make the internet a better experience for those legacy devices as well.

## Summary

The internet is ready for another increase in TCP's initial congestion window as long as we can do it carefully and with the help of TCP BBR as a congestion control protocol.

I'm going to continue investigating and talking about the most performant TCP settings for the modern internet, and I hope I can drive some adoption to make the modern web faster for everyone.
