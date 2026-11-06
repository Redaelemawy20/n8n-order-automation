import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : crepe home
// Nodes   : 4  |  Connections: 3
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// TelegramTrigger                    telegramTrigger            [creds]
// CodeInJavascript                   code
// SendATextMessage                   telegram                   [creds]
// HttpRequest                        httpRequest
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// TelegramTrigger
//    → CodeInJavascript
//      → HttpRequest
//        → SendATextMessage
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: '73ye1WRmUha27y5I',
    name: 'crepe home',
    active: true,
    isArchived: false,
    settings: { executionOrder: 'v1', binaryMode: 'separate', availableInMCP: true },
})
export class CrepeHomeWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: 'a37d162f-0da7-423c-b312-a896897b24d9',
        webhookId: '98eccb20-0da0-42de-a873-a4afe9546899',
        name: 'Telegram Trigger',
        type: 'n8n-nodes-base.telegramTrigger',
        version: 1.5,
        position: [-32, -96],
        credentials: { telegramApi: { id: 'fdEvzhUHPg614NZk', name: 'Telegram account' } },
    })
    TelegramTrigger = {
        updates: ['message'],
        additionalFields: {},
    };

    @node({
        id: 'b243e0e1-482a-4984-981c-bf446c3158de',
        name: 'Code in JavaScript',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [176, 128],
    })
    CodeInJavascript = {
        jsCode: `const message = $json.message.text || '';

// Convert Arabic-Indic (٠-٩) and Persian (۰-۹) digits to 0-9
const normalizeDigits = (str) =>
  str
    .replace(/[\\u0660-\\u0669]/g, d => d.charCodeAt(0) - 0x0660)
    .replace(/[\\u06F0-\\u06F9]/g, d => d.charCodeAt(0) - 0x06F0);

const orders = message
  .split('\\n')
  .map(line => {
    const clean = normalizeDigits(line)
      .replace(/[\\u200E\\u200F\\u061C\\u202A-\\u202E]/g, '') // strip invisible RTL/LTR marks Telegram may add
      .trim();

    const match = clean.match(/^(\\d+)\\s+(.+)$/);
    if (!match) return null;

    return {
      quantity: Number(match[1]),
      type: match[2].trim()
    };
  })
  .filter(Boolean);

return orders.map(order => ({ json: order }));
`,
    };

    @node({
        id: '3ea16d03-1d6f-4cfb-980c-c55db8a7a78d',
        webhookId: '1b033d8f-f74b-49a6-ad6e-cad56ad7c5ba',
        name: 'Send a text message',
        type: 'n8n-nodes-base.telegram',
        version: 1.2,
        position: [672, -208],
        credentials: { telegramApi: { id: 'fdEvzhUHPg614NZk', name: 'Telegram account' } },
    })
    SendATextMessage = {
        resource: 'message',
        operation: 'sendMessage',
        chatId: "={{ $('Telegram Trigger').item.json.message.chat.id }}",
        text: `=عميلنا العزيز تم استقبال طلبك بنجاح
{{ $json.quantity }} {{ $json.item_name }}`,
        additionalFields: {
            appendAttribution: false,
        },
    };

    @node({
        id: '2a65ead9-c1ec-481a-bfdd-d1a5f9d9f4d4',
        name: 'HTTP Request',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.5,
        position: [432, -48],
    })
    HttpRequest = {
        method: 'POST',
        url: 'http://host.docker.internal:3000/api/orders',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: `={ "item_name": "{{ $json.type }}", "quantity": {{ $json.quantity }} }
`,
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.TelegramTrigger.out(0).to(this.CodeInJavascript.in(0));
        this.CodeInJavascript.out(0).to(this.HttpRequest.in(0));
        this.HttpRequest.out(0).to(this.SendATextMessage.in(0));
    }
}
