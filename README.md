# crystal-event-emitter
`crystal-event-emitter` acts as a small ES2015+ base class for event emitters.
# Examples

If you want to see the library in action, feel free to check out the [tests](https://github.com/kdex/crystal-event-emitter/blob/master/test/index.js).

# API reference
This base class adds the following methods to the derived class' prototype:

#### <b>constructor</b>(options)

Constructs a new EventEmitter instance, usually called using `super(options)`. The `options` argument is an optional object with the following keys:

##### inferListeners

Boolean property that determines whether to automatically infer listener names and call them without explicitly registering them (default: `false`). For example, if `emitter.emit("closed")` is called, it will try to call `emitter.onClosed` even if you didn't explicitly add any event listeners to the `"closed"` event. The `*` event name can be inferred by providing a method named `onAny`.

#### EventEmitter.prototype.<b>addEventListener</b>(event, callback)

Registers a new event listener for an event named `event`. If at some point in the future `event` is <a href="#eventemitterprototypeemitevent-args">emitted</a>, the function `callback` will be called.

The special event called `*` can be used to create a listener that fires for any event name.

If `callback` is already registered for the event name `event`, calling this method has no effect.

Returns a reference to the derived class. If `callback` is not a function, a TypeError is thrown.

#### EventEmitter.prototype.<b>removeEventListener</b>(event, callback)

Removes the event listener `callback` for an event named `event` which prevents `callback` from being called in the future if an event with the name `event` is <a href="#eventemitterprototypeemitevent-args">emitted</a>.

If `callback` has not been registered for the event name `event`, calling this method has no effect.

Returns a reference to the derived class. If `callback` is not a function, a TypeError is thrown.

#### EventEmitter.prototype.<b>on</b>(event, callback)

Synonymous to <a href="#eventemitterprototypeaddeventlistenerevent-callback">addEventListener</a>.

#### EventEmitter.prototype.<b>off</b>(event, callback)

Synonymous to <a href="#eventemitterprototyperemoveeventlistenerevent-callback">removeEventListener</a>.

#### EventEmitter.prototype.<b>emit</b>(event[, ...args])

Emits a new event by the name of `event`. All currently registered event listeners for `event` will then be called using the optional argument list `args`.

If there are no callbacks for the event name `event`, calling this method has no effect and `false` is returned. Otherwise, a reference to the derived class is returned.