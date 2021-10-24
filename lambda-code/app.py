import requests
from datetime import datetime
import json


def send_slack(msg):
    """ Send payload to slack """
    webhook_url = "https://hooks.slack.com/services/******"
    footer_icon = 'https://cdkworkshop.com/images/new-cdk-logo.png'
    color = '#36C5F0'
    level = ':white_check_mark: INFO :white_check_mark:'
    curr_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    payload = {"username": "Test",
               "attachments": [{
                                "pretext": level,
                                "color": color,
                                "text": f"{msg}",
                                "footer": f"{curr_time}",
                                "footer_icon": footer_icon}]}
    requests.post(webhook_url, data=json.dumps(payload), headers={'Content-Type': 'application/json'})


def handler(event, context):
    detail_type = event.get('detail-type', '')
    instance_id = event['detail']['instance-id']
    action = event['detail']['instance-action']
    message = f'{detail_type}\nresource: {instance_id}, action: *{action}*'
    send_slack(message)
