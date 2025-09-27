import { Inbound } from '@inboundemail/sdk';

if (!process.env.INBOUND_API_KEY) {
	throw 'Missing Inbound API key';
}

const inbound = new Inbound(process.env.INBOUND_API_KEY);

export default inbound;
