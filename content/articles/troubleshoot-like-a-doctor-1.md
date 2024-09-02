+++
title = 'Troubleshoot Like a Doctor: Differential Diagnosis'
date = 2024-09-02T10:29:40-04:00
draft = false
tags = ["troubleshooting"]
+++

## Introduction

The IT field is terrible at teaching people how to troubleshoot. Sure, if you got a CompTIA A+ or a CCNA, there were modules that talked about how to solve problems, but how much time did you actually spend on those modules? The CCNA course I took spent all of 5 minutes on it, with the message "there's probably going to be a question that will ask what order these steps come in." 

Most of the training is on-the-job training, which means that the troubleshooting skill people end up with is dependent on two factors: having good mentors in that job and having enough time to think logically through problems.

I was fortunate to have both of those things, and I also had the benefit of learning from a profession with a far more established troubleshooting training regime: medicine.

When I first got into a position where I had a lot of troubleshooting responsibility, my wife was in medical school. I remember asking her what homework she was working on one day, and she replied, "I'm learning the diagnostic framework used to diagnose patients."

That blew me away. In addition to learning microbiology and organic chemistry and anatomy and neuroscience and everything else, medical students spend a significant amount of time learning a framework that helps them diagnose patients. I immediately stole my wife's notes and spent the next couple of years adapting that framework to IT troubleshooting.

Just like any other time you learn a new mental model that helps organize your thoughts, applying this diagnostic framework takes time and practice, especially when you're doing it on your own. Anyone who wants to adopt this framework needs to stick with it diligently, giving it time to become second nature as they face problems.

I gave it that time, and it elevated my troubleshooting skill to truly elite levels. I've become one of the best problem solvers at my company, and I find myself consistently called in to solve the most subtle, complicated issues that other people have spent days or weeks working through.

This framework comes in three parts:
- Differential Diagnosis
- HOPS, or the flow of an office visit
- Type 1 vs Type 2 thought patterns

I'll cover each of these in a separate post, and today we'll start with Differential Diagnosis.

## What is Differential Diagnosis?

Differential diagnosis, or dDx, is the process of creating an ordered list of potential causes of an issue. Based on the symptoms, come up with a list of the most likely causes and add potentially dangerous causes to it.

Then, starting at the top of the list, think through tests that you can run to either **rule out** or **confirm** each potential cause. As you execute these tests, keep re-evaluating the dDx and see how it changes.

Let's work through a simplified medical example:

### Simple ER Example

*EMT transports a patient to the ER from the scene of a car accident. The patient is complaining of chest pain.*

At first glance, there are two facts we can work with: the patient is experiencing chest pain, and they were somehow involved in a car crash.

From that, we can come up with some likely and some severe potential diagnoses:

1. Bruising in the chest - very likely, since this is common when a seat belt restrains someone in crash.
2. Heart attack - may or may not be likely, depending on the age and overall health of the patient, but could be fatal.
3. Fractured rib - less likely than bruising, but it would still fit with the overall symptoms.

Our initial dDx includes two likely diagnoses and a very severe diagnosis. The first step a medical team would take is to **rule out** the most severe diagnosis. The test for that is an EKG.

Assuming that comes back clear, the reevaluated dDx has two options:

1. Bruising in the chest
2. Fractured rib

There's not really a good way to confirm the first one; any bruising will show up several hours after the crash, and it would probably also be there for a fractured rib, so it's a better bet to try **ruling out** or **confirming** the second option. So the next step would be to get a chest X-ray.

The results of that X-ray will either positively confirm a fractured rib or rule out that option. So that test will leave one option left, and that is ultimately the diagnosis.

### More Complex Usage

That was a relatively simple example, but let's consider something a little more complicated. In this case, an urgent care physician needs to decide which specialist to refer a patient to:

*A patient arrives at urgent care complaining of knee pain. They took an awkward fall and are currently unable to put weight through the knee.*

In this case, the physician is thinking a little differently. There's not much they can do to treat an injured knee in the clinic, and they may send the patient to different specialists depending what the issue is.

In this case, the differential looks more like this:

1. Soft tissue injury - ACL, MCL, LCL, PCL, or meniscus. Refer to sports medicine for a detailed diagnosis and to make the decision of pure rehab versus surgery.
2. Bone fracture - Refer to orthopedics to evaluate the need to reset the bone before putting a cast on.

If the urgent care has an X-ray machine, that could be a useful tool to either **rule out** or **confirm** a bone fracture. That single test will leave only one option left, and the physician will know where to send the patient next.

## How Does Differential Diagnosis Apply to IT?

Applied to IT, dDx usually follows the more complex example. Even if you aren't redirecting tickets to specialist teams, IT tends to operate in domains, and it's helpful to isolate a domain before diving in too deep with your troubleshooting.

That's why, for almost every issue I encounter, my initial dDx looks like this:

1. Client
2. Network
3. Server

My first goal is to isolate one of those options and dig in from there. Let's look at an example:

*The intranet site is slow for everyone at this single office location. No other users have reported issues.*

Since the issue is isolated to a single site, and no one else is bothered, that eliminates the Server immediately. If the Server was at fault, it would be a global issue.

Now that my dDx is isolated to either Client or Network, I can dig in a little deeper. Next, I might ask one of the users at that site to restart their machine, clear their browser cache, and try again. If things perform well immediately after a restart, it's likely a client issue. If not, it becomes a network issue.

If it becomes isolated to a network issue, then my dDx changes significantly:

1. Network capacity at the site
2. Last-mile ISP issues
3. Changes to firewall rules that may have eliminated the site's subnet
4. Poor geographic load balancing

And from that point, I can run tests to rule out or confirm any of these issues.

## Summary

Differential diagnosis can be a key tool for IT troubleshooting, just like it is for medicine. When you use it, remember how to set it up:

- Create an ordered list of possible causes based on likelihood and severity
- Think of tests targeted to either **rule out** or **confirm** individual items on the list

And also keep in mind how you iterate through the list:

- Start broad, considering larger domains before zooming into a lot of detail
- Continuously rewrite the dDx as you learn new information about the problem

Good luck with it, and feel free to reach out to me with any questions!