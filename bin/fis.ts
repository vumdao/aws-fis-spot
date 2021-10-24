#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { EventRule } from '../lib/event-rule';

const app = new cdk.App();

new EventRule(app, 'SpotEvent', {
  description: "Fault Injection Simulate Spot Instance Interrupt",
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-northeast-1'
  }
});