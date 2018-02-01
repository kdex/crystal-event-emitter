/**
* A wildcard event; this was previously implemented as a symbol for consumers to import.
* Since it is unclear weather strings are fine, we'll keep this around for now
*/
export const ANY = "*";
/**
* Since ECMAScript currently lacks private fields, we will use this symbol to store internal properties. This allows consumers to use any property they want.
*/
const EXTENSIONS = Symbol("[[Extensions]]");
/**
* Performs a type assertion to ensure the API is used correctly.
* @param {any} unknown
* An unknown paramater that should be type-checked
* @param {function} constructor
* The constructor function that will be used in an `instanceof` type check
* @param {string} [details = ""]
* Details to append in the error message.
* @return {boolean} `true` if the assertion was valid.
* @throws {TypeError} when `unknown` is not an instance of `constructor`.
*/
const assertInstance = (unknown, constructor, details = "") => {
	if (unknown instanceof constructor) {
		return true;
	}
	else {
		throw new TypeError(`Expected argument to be an instance of \`${constructor.name}\`, but instead got ${`an instance of \`${unknown.constructor.name}\``}. ${details}`.trim());
	}
};
/**
* A base class to extend to create event emitters. Event emitters are objects that can register event handlers that are run when a certain event is emitted.
*/
export class EventEmitter {
	/**
	* Constructors a new {@link EventEmitter}.
	* @param {object} options
	* A set of options
	* @param {boolean} options.inferListeners
	* If `true`, this will automatically try to call a method `onX` if the event `x` is emitted. If the event `*` is emitted, this will try to call `onAny`.
	*
	* If `false`, you will have to bind every listener manually.
	* @throws {TypeError} when `options` is not an instance of `Object`
	*/
	constructor(options = {}) {
		assertInstance(options, Object);
		/**
		* For all intents and purposes, this should be considered a private implementation detail until ECMAScript supports private fields.
		* @type {object}
		* @property {object} this[EXTENSIONS].options
		* See {@link constructor}.
		* @property {Map<string|symbol, function[]>} this[EXTENSIONS].events
		* The internal storage for event listeners
		*/
		this[EXTENSIONS] = {
			options,
			events: new Map()
		};
	}
	/**
	* Adds a new event listener identified by `event`, which causes `callback` to be called when `event` is emitted.
	*
	* Using the wildcard event `*` causes the `callback` to be called whenever an event emission occurs, regardless of its name.
	* @param {string|symbol} event
	* An identifier to refer to the event
	* @param {function(...args: any): any} callback
	* A function that is called when the event is emitted
	* @return {EventEmitter}
	* The instance that the event listener was added to.
	* @throws {TypeError} when `callback` is not an instance of `Function`
	*/
	addEventListener(event, callback) {
		assertInstance(callback, Function);
		/* Retrieve the listeners for this event type */
		let callbacks = this[EXTENSIONS].events.get(event);
		/* Add a new set if necessary */
		if (!callbacks || !callbacks.size) {
			callbacks = new Set();
			this[EXTENSIONS].events.set(event, callbacks);
		}
		/* Add a callback if necessary */
		if (!callbacks.has(callback)) {
			callbacks.add(callback);
		}
		return this;
	}
	/**
	* Alias for {@link addEventListener}.
	*
	* @param {string|symbol} event
	* An identifier to refer to the event
	* @param {function(...args: any): any} callback
	* A function that is called when the event is emitted
	* @return {EventEmitter}
	* The instance that the event listener was added to.
	*/
	on(event, callback) {
		return this.addEventListener(event, callback);
	}
	/**
	* Identical to {@link addEventListener}, with the only difference that the event listener is automatically removed the first time the `callback` is called.
	* @param {string|symbol} event
	* An identifier to refer to the event
	* @param {function(...args: any): any} callback
	* A function that is called when the event is emitted
	* @return {EventEmitter}
	* The instance that the event listener was added to.
	* @throws {TypeError} when `callback` is not an instance of `Function`
	*/
	once(event, callback) {
		assertInstance(callback, Function);
		callback[EXTENSIONS] = {
			once: true
		};
		return this.addEventListener(event, callback);
	}
	/**
	* Removes all event listeners for a given `event`.
	*
	* Note that this does not require a reference to any specific callback.
	*
	* If there aren't any event listeners for `event`, a call to this method has no effect.
	* @param {string|symbol} event
	* An identifier to refer to the event
	* @return {EventEmitter}
	* The instance that the event listeners were removed from.
	*/
	removeEventListeners(event) {
		if (event) {
			/* Remove all event listeners for a given event */
			for (const [evt, callbacks] of this[EXTENSIONS].events) {
				for (const callback of callbacks) {
					if (event === evt) {
						this.removeEventListener(evt, callback);
					}
				}
			}
		}
		else {
			/* Remove all event listeners */
			for (const [event, callbacks] of this[EXTENSIONS].events) {
				for (const callback of callbacks) {
					if (event === ANY) {
						this[EXTENSIONS].events.delete(event);
					}
					else {
						this.removeEventListener(event, callback);
					}
				}
			}
		}
		return this;
	}
	/**
	* Removes a single even listener identified by `event` and a `callback`.
	*
	* If there aren't any event listeners for `event`, a call to this method has no effect.
	*
	* Using the wildcard event `*` will be equivalent to {@link removeEventListeners}.
	* @param {string|symbol} event
	* An identifier to refer to event
	* @param {function(...args: any): any} [callback]
	* The function that was used to create the event listener.
	*
	* If the wildcard event `*` is used, the `callback` is optional.
	* @return {EventEmitter}
	* The instance that the event listener was removed from.
	* @throws {TypeError} when `callback` is not an instance of `Function`
	*/
	removeEventListener(event, callback) {
		if (event === ANY) {
			this.removeEventListeners();
			return this;
		}
		assertInstance(callback, Function, `No callback has been specified. If you'd like to remove all events of type ${event}, use removeEventListeners instead`);
		/* Retrieve the listeners for this event type */
		const callbacks = this[EXTENSIONS].events.get(event);
		/* If no callbacks are registered, ignore */
		if (!callbacks) {
			return this;
		}
		/* Remove the callback if necessary */
		if (callbacks.has(callback)) {
			callbacks.delete(callback);
		}
		/* Remove the event if necessary */
		if (!callbacks.size) {
			this[EXTENSIONS].events.delete(event);
		}
		return this;
	}
	/**
	* Alias for {@link removeEventListener}.
	*
	* @param {string|symbol} event
	* An identifier to refer to event
	* @param {function(...args: any): any} [callback]
	* The function that was used to create the event listener.
	*
	* If the wildcard event `*` is used, the `callback` is optional.
	* @return {EventEmitter}
	* The instance that the event listener was removed from.
	*/
	off(event, callback) {
		return this.removeEventListener(event, callback);
	}
	/**
	* Emits the event `event` causing all its registered callbacks to be called using the arguments `args`.
	*
	* @param {string|symbol} event
	* An identifier to refer to event
	* @param {...any} [args]
	* The arguments to use when calling the event listeners for `event`.
	*
	* @return {EventEmitter}
	* The instance that was used to emit the event.
	*/
	emit(event, ...args) {
		if (event !== ANY) {
			this.emit(ANY, event, ...args);
		}
		/* Handle inferred listeners first */
		if (this[EXTENSIONS].options.inferListeners && typeof event === "string") {
			let inferredListener = `on${event[0].toUpperCase()}${event.substr(1)}`;
			if (inferredListener === "on*") {
				inferredListener = "onAny";
			}
			if (this[inferredListener] instanceof Function) {
				this[inferredListener](...args);
			}
		}
		const callbacks = this[EXTENSIONS].events.get(event);
		if (callbacks) {
			for (const callback of callbacks) {
				callback(...args);
				if (callback[EXTENSIONS] && callback[EXTENSIONS].once) {
					this.removeEventListener(event, callback);
				}
			}
		}
		return this;
	}
}
export default EventEmitter;