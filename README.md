# event-emitter
`event-emitter` acts as a small ES6+ base class for event emitters. It's written in ES6 and distributed in virtually all module formats known to mankind. Just pick one.
# API reference
This base class adds the following methods to the derived class' prototype:

#### EventEmitter.prototype.<b>addEventListener</b>(event, callback)

Registers a new event listener for an event named `event`. If at some point in the future `event` is <a href="event-emitter#emit">emitted</a>, the function `callback` will be called.

If `callback` is already registered for the event name `event`, calling this method has no effect.

Returns a reference to the derived class. If `callback` is not a function, a TypeError is thrown.

#### EventEmitter.prototype.<b>removeEventListener</b>(event, callback)

Removes the event listener `callback` for an event named `event` which prevents `callback` from being called in the future if an event with the name `event` is <a href="event-emitter#emit">emitted</a>.

If `callback` has not been registered for the event name `event`, calling this method has no effect.

Returns a reference to the derived class. If `callback` is not a function, a TypeError is thrown.

#### EventEmitter.prototype.<b>on</b>(event, callback)

Synonymous to <a href="event-emitter#on">addEventListener</a>.

#### EventEmitter.prototype.<b>off</b>(event, callback)

Synonymous to <a href="event-emitter#off">removeEventListener</a>.

#### EventEmitter.prototype.<b>emit</b>(event[, ...args])

Emits a new event by the name of `event`. All currently registered event listeners for `event` will then be called using the optional argument list `args`.

If there are no callbacks for the event name `event`, calling this method has no effect and `false` is returned. Otherwise, a reference to the derived class is returned.
