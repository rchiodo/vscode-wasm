/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import RAL from '../common/ral';
import { BaseServiceConnection, BaseClientConnection, Message, RequestType } from '../common/connection';

export class ClientConnection<Requests extends RequestType | undefined = undefined> extends BaseClientConnection<Requests> {

	private readonly port: MessagePort | Worker | DedicatedWorkerGlobalScope;

	constructor(port: MessagePort | Worker | DedicatedWorkerGlobalScope) {
		super();
		this.port = port;
		this.port.onmessage = ((event: MessageEvent<Message>) => {
			this.handleMessage(event.data);
		});
	}

	protected postMessage(sharedArrayBuffer: SharedArrayBuffer) {
		this.port.postMessage(sharedArrayBuffer);
	}
}

export class ServiceConnection<RequestHandlers extends RequestType | undefined = undefined> extends BaseServiceConnection<RequestHandlers> {

	private readonly port: MessagePort | Worker | DedicatedWorkerGlobalScope;

	constructor(port: MessagePort | Worker | DedicatedWorkerGlobalScope) {
		super();
		this.port = port;
		this.port.onmessage = (async (event: MessageEvent<SharedArrayBuffer>) => {
			try {
				await this.handleMessage(event.data);
			} catch (error) {
				RAL().console.error(error);
			}
		});
	}

	protected postMessage(message: Message): void {
		this.port.postMessage(message);
	}
}