+++
title = 'Troubleshoot Like a Doctor: HOPS'
date = 2024-12-28T14:26:52-08:00
draft = false
tags = ["troubleshooting"]
+++

## Introduction

The last time we looked at how to diagnose like a doctor, we focused on the differential diagnosis (dDx). This is the mental model that doctors use to assess possible causes of an issue and prioritize tests to figure out what's happening. For more information on differential diagnosis, you can read [Part 1](/articles/troubleshoot-like-a-doctor-1) of this series.

Today, we need to talk through how we gather the best information to feed your dDx and how to make your diagnostic actions count. Doctors use a standardized flow of information that starts as soon as a patients gets to the waiting room to put together their differential, so we're going to break down that information flow, show how that adapts to IT troubleshooting, and give some more options to help prioritize your tests.

## HOPS - The Standardized Medical Visit Flow

HOPS stands for History, Observation, Palpation, and Specific Tests. This acronym comes from the world of physical therapy, but the principles are universal across medical visits.  Think back to your last visit to a medical office:

### History

If this is your first visit to a particular, you likely need to fill out a bunch of forms. These forms ask about your entire medical history, your lifestyle habits, and any medical issues your parents or grandparents have ever had.

When you get into an exam room, one of your first interactions with a nurse will be a line-by-line examination of those forms you just filled out.

One that's finished, you'll finally get the question "So what brings you in today?" 

This is all crucial data. If you have a family history of skin cancers, that provider is going to look at a mole or birthmark far more closely than they would otherwise.
### Observation

Even while the nurse is going through those rote questions, they will be gathering both subjective and objective data about your current state. They may get your heart rate, blood pressure, pulse oxygen, and weight. If you appear pale, can't walk straight, seem argumentative, or in any other way look or behave atypically, they'll make note of it.

None of this is meant to be judgmental. This is all more data that feeds the differential. 

### Transitioning from Gathering Data to Ordering Tests

At this point, a provider has your medical history, family history, information about your current state, and a list of your concerns. This is enough data to begin building the dDx and start ordering tests.

### Palpations

Palpations is an overly medical term that just means poking and prodding. Because HOPS is specifically targeted to physical therapy, palpations is a good term to describe all basic physical exams that a physical therapist might perform on a patient.

In a larger medical context, palpations really refers to any test that the provider can perform in the office that day. If you have a sore throat, most offices can perform a COVID and a strep test immediately. Likewise, if you go to an urgent care office that has an x-ray machine, they can perform an x-ray really easily.

Depending on the office you go to, there are a wide range of diagnostic tests that can be administered easily.

### Specific Tests

 Specific tests are any tests that require a referral or otherwise can't be performed in that office visit. These are more difficult to schedule and administer because the doctor needs to file additional paperwork with insurance companies, the patient has to carve more time out of their schedule to go to another office and get something done, and it's more likely that these tests involve an even busier medical office. All these things delay the patient getting better, so these specific tests are only performed when all of the easier tests have been exhausted.

## HOSI - The Standardized Flow for IT

We can easily adapt HOPS to IT troubleshooting as HOSI: History, Observation, Safe Tests, Impacting Tests. The next time you get pulled into an issue, try running through this process and see if it helps your decision-making.

### History

- Does the impacted system have a history of similar issues?
- When did impact start?
- Were there any changes to the system or the underlying infrastructure within the 24 hours before impact started?
- Were there any larger changes in the environment in the week before impact started?

### Observation

- What does the issue look like?
- Is something broken or just slow?
- Is it possible to bound the issue? Are the affected users in a specific office, geography, client device type, or job role?
- Is just one system affected or multiple?
- Are there any error messages?

### Start Building the dDx

- Based on the history and observation, are any infrastructure segments ruled out or in?
- Does it seem like client, server, or network?
- What issues would lead to this set of symptoms?
- Are there any high severity issues (e.g. cyber issues) that would lead to these symptoms?

### Safe Tests

Just like in a medical office, the tests that qualify as safe for you depend on what tools you have available. A good guiding light is to think *what can I do that won't make this issue worse?*

For example, asking a user to clear their browser cache and reboot before trying again is a safe test. Ping and traceroute tests are almost always safe. Taking a packet capture on a device with plenty of spare CPU and memory is usually safe, but taking a packet capture on a device with high utilization may not be safe. 

If you have a syslog collector, then log analysis will be safe, but if you have to log into a server that's having issues to zip up and export several gigabytes of logs, that may make things worse.

### Impacting Tests

Once you've exhausted the safe diagnostic steps you can take, you need to start looking at impacting tests. These tests almost always have some sort of temporary impact, so your goal should be to do as much as possible without further impacting your users.

A great example of an impacting tests is rebooting servers. Even with good resiliency engineering, a rebooted server almost always results in dropped user sessions. Another great example is changing settings. Tweaking a configuration could fix an issue, but it can also produce further impact.

## Example - Video Calls Keep Dropping

You get a ticket assigned to you where users at a specific office have video calls with terrible video and audio quality that also keep dropping. As you get the history and observations, you learn the following:

- Impact started about a week ago
- This hasn't happened at this office before
- Shortly before impact started, a new team moved to this office
- While video calls are the biggest disruption, web browsing is also pretty slow at the same time
- The issue primarily occurs around 9am and 1pm
- Nearby offices are not affected
- Both Wifi and Ethernet connections are affected

With all of this data, you can start building out the dDx:

1. Too little capacity on the circuit
2. Network issues on the local gear
3. Network issues on the ISP circuit
4. Client issues (maybe a bad security patch)

You choose to begin focusing on the network issues, so you log into the local switch and router and start checking interface statistics. Resetting interface counters is a safe test, so you go ahead and do that. 

After a day of information gathering, you can see that there are no CRC errors or discarded frames. You can also see that the rate in and out of the router uplink to the ISP modem maxes out pretty close to the circuit bandwidth.

A call to the ISP confirms that around 9am and 1pm each work day, the circuit utilization exceeds 90%. You can now put in the request for a circuit upgrade at this site with a root cause identified.

To summarize, the information gained under the History and Observation steps gave the clues that this issue is isolated to a single office, they recently had a change in headcount, and the issue primarily happens when people first log on in the morning and when they log in after lunch. This targets network capacity as the most likely issue, and you chose to rule out issues within the local network while collecting data on the overall utilization. 

## Summary

HOPS, or HOSI for us IT folks, is a really effective way to gather data on an issue before building out a differential diagnosis. It also helps decide which diagnostic tests to perform while reducing further impact on the affected users.

As you continue troubleshooting, work through those History and Observation questions to give yourself bounds for your differential diagnosis. And as you identify ways to rule out or confirm potential diagnoses, decide which ones are safe, and run those tests first.