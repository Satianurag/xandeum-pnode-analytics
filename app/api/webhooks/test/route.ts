import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

interface WebhookTestRequest {
    type: 'discord' | 'slack' | 'telegram';
    webhookUrl: string;
    testMessage?: string;
}

interface WebhookResponse {
    success: boolean;
    message: string;
    timestamp: string;
}

// ============================================================
// DISCORD WEBHOOK
// ============================================================

async function sendDiscordWebhook(url: string, message: string): Promise<boolean> {
    const discordPayload = {
        embeds: [{
            title: '🧪 Xandeum pNode Analytics - Test Alert',
            description: message,
            color: 0x8b5cf6, // Purple matching theme
            fields: [
                {
                    name: 'Status',
                    value: '✅ Webhook connection successful',
                    inline: true,
                },
                {
                    name: 'Source',
                    value: 'pNode Analytics Dashboard',
                    inline: true,
                },
            ],
            footer: {
                text: 'This is a test message from your pNode Analytics dashboard',
            },
            timestamp: new Date().toISOString(),
        }],
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload),
    });

    return response.ok;
}

// ============================================================
// SLACK WEBHOOK
// ============================================================

async function sendSlackWebhook(url: string, message: string): Promise<boolean> {
    const slackPayload = {
        blocks: [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: '🧪 Xandeum pNode Analytics - Test Alert',
                    emoji: true,
                },
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: message,
                },
            },
            {
                type: 'section',
                fields: [
                    {
                        type: 'mrkdwn',
                        text: '*Status:*\n✅ Webhook connection successful',
                    },
                    {
                        type: 'mrkdwn',
                        text: '*Source:*\npNode Analytics Dashboard',
                    },
                ],
            },
            {
                type: 'context',
                elements: [
                    {
                        type: 'mrkdwn',
                        text: `_Test message sent at ${new Date().toLocaleString()}_`,
                    },
                ],
            },
        ],
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackPayload),
    });

    return response.ok;
}

// ============================================================
// TELEGRAM WEBHOOK
// ============================================================

async function sendTelegramWebhook(botToken: string, chatId: string, message: string): Promise<boolean> {
    const telegramMessage = `
🧪 *Xandeum pNode Analytics - Test Alert*

${message}

*Status:* ✅ Webhook connection successful
*Source:* pNode Analytics Dashboard

_This is a test message from your pNode Analytics dashboard_
`;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: telegramMessage,
            parse_mode: 'Markdown',
        }),
    });

    return response.ok;
}

// ============================================================
// API ROUTE HANDLER
// ============================================================

export async function POST(request: NextRequest): Promise<NextResponse<WebhookResponse>> {
    try {
        const body: WebhookTestRequest = await request.json();
        const { type, webhookUrl, testMessage } = body;

        if (!type || !webhookUrl) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Missing required fields: type and webhookUrl',
                    timestamp: new Date().toISOString(),
                },
                { status: 400 }
            );
        }

        const message = testMessage || 'Your webhook integration is working correctly! You will receive alerts here when configured.';
        let success = false;

        switch (type) {
            case 'discord':
                success = await sendDiscordWebhook(webhookUrl, message);
                break;
            case 'slack':
                success = await sendSlackWebhook(webhookUrl, message);
                break;
            case 'telegram':
                // For Telegram, webhookUrl should be in format: botToken:chatId
                const [botToken, chatId] = webhookUrl.split(':');
                if (!botToken || !chatId) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: 'Invalid Telegram format. Use: botToken:chatId',
                            timestamp: new Date().toISOString(),
                        },
                        { status: 400 }
                    );
                }
                success = await sendTelegramWebhook(botToken, chatId, message);
                break;
            default:
                return NextResponse.json(
                    {
                        success: false,
                        message: `Invalid webhook type: ${type}. Supported: discord, slack, telegram`,
                        timestamp: new Date().toISOString(),
                    },
                    { status: 400 }
                );
        }

        if (success) {
            return NextResponse.json({
                success: true,
                message: `${type.charAt(0).toUpperCase() + type.slice(1)} webhook test sent successfully!`,
                timestamp: new Date().toISOString(),
            });
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: `Failed to send ${type} webhook. Please check your webhook URL.`,
                    timestamp: new Date().toISOString(),
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Webhook test error:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
