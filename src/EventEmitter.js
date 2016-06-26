export const ANY = Symbol("Any event");
export class EventEmitter {
	constructor(options = {}) {
		if (!(options instanceof Object)) {
			throw new TypeError();
		}
		this.options = options;
		this.events = new Map();
	}
	addEventListener(event, callback) {
		if (callback instanceof Function) {
			/* Retrieve the listeners for this event type */
			let callbacks = this.events.get(event);
			/* Add a new set if necessary */
			if (!callbacks || !callbacks.size) {
				callbacks = new Set();
				this.events.set(event, callbacks);
			}
			/* Add a callback if necessary */
			if (!callbacks.has(callback)) {
				callbacks.add(callback);
			}
			return this;
		}
		else {
			throw new TypeError();
		}
	}
	removeEventListener(event, callback) {
		if (callback instanceof Function) {
			/* Retrieve the listeners for this event type */
			let callbacks = this.events.get(event);
			/* Add a new set if necessary */
			if (!callbacks) {
				return this;
			}
			/* Remove the callback if necessary */
			if (callbacks.has(callback)) {
				callbacks.delete(callback);
			}
			/* Remove the event if necessary */
			if (!callbacks.size) {
				this.events.delete(event);
			}
			return this;
		}
		else {
			throw new TypeError();
		}
	}
	emit(event, ...args) {
		if (event !== ANY) {
			this.emit(ANY, ...args);
		}
		let inferenceSuccessful = false;
		/* Handle inferred listeners first */
		if (this.options.inferListeners && typeof event === "string") {
			const inferredListener = `on${event[0].toUpperCase()}${event.substr(1)}`;
			if (this[inferredListener] instanceof Function) {
				inferenceSuccessful = true;
				this[inferredListener].apply(this, args);
			}
		}
		const callbacks = this.events.get(event);
		if (!callbacks || !callbacks.size) {
			return inferenceSuccessful;
		}
		for (const callback of callbacks) {
			callback.apply(null, args);
		}
		return this;
	}
}
EventEmitter.prototype.on = EventEmitter.prototype.addEventListener;
EventEmitter.prototype.off = EventEmitter.prototype.removeEventListener;
export default EventEmitter;