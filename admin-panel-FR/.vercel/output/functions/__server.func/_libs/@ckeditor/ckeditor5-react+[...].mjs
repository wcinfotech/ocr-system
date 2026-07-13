import { o as __toESM, r as __exportAll, t as __commonJSMin } from "../../_runtime.mjs";
import { a as createDefer, c as isCKEditorFreeLicense, d as once, f as uid, i as compareInstalledCKBaseVersion, l as kebabToCamelCase, n as assignElementToEditorConfig, o as createIntegrationUsageDataPlugin, r as assignInitialDataToEditorConfig, s as getInstalledCKBaseFeatures, t as appendExtraPluginsToEditorConfig, u as mapObjectKeys } from "./ckeditor5-integrations-common+[...].mjs";
//#region node_modules/react/cjs/react.production.js
/**
* @license React
* react.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
	function getIteratorFn(maybeIterable) {
		if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
		maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
		return "function" === typeof maybeIterable ? maybeIterable : null;
	}
	var ReactNoopUpdateQueue = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	}, assign = Object.assign, emptyObject = {};
	function Component(props, context, updater) {
		this.props = props;
		this.context = context;
		this.refs = emptyObject;
		this.updater = updater || ReactNoopUpdateQueue;
	}
	Component.prototype.isReactComponent = {};
	Component.prototype.setState = function(partialState, callback) {
		if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, partialState, callback, "setState");
	};
	Component.prototype.forceUpdate = function(callback) {
		this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
	};
	function ComponentDummy() {}
	ComponentDummy.prototype = Component.prototype;
	function PureComponent(props, context, updater) {
		this.props = props;
		this.context = context;
		this.refs = emptyObject;
		this.updater = updater || ReactNoopUpdateQueue;
	}
	var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
	pureComponentPrototype.constructor = PureComponent;
	assign(pureComponentPrototype, Component.prototype);
	pureComponentPrototype.isPureReactComponent = !0;
	var isArrayImpl = Array.isArray;
	function noop() {}
	var ReactSharedInternals = {
		H: null,
		A: null,
		T: null,
		S: null
	}, hasOwnProperty = Object.prototype.hasOwnProperty;
	function ReactElement(type, key, props) {
		var refProp = props.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== refProp ? refProp : null,
			props
		};
	}
	function cloneAndReplaceKey(oldElement, newKey) {
		return ReactElement(oldElement.type, newKey, oldElement.props);
	}
	function isValidElement(object) {
		return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
	}
	function escape(key) {
		var escaperLookup = {
			"=": "=0",
			":": "=2"
		};
		return "$" + key.replace(/[=:]/g, function(match) {
			return escaperLookup[match];
		});
	}
	var userProvidedKeyEscapeRegex = /\/+/g;
	function getElementKey(element, index) {
		return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
	}
	function resolveThenable(thenable) {
		switch (thenable.status) {
			case "fulfilled": return thenable.value;
			case "rejected": throw thenable.reason;
			default: switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(function(fulfilledValue) {
				"pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
			}, function(error) {
				"pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
			})), thenable.status) {
				case "fulfilled": return thenable.value;
				case "rejected": throw thenable.reason;
			}
		}
		throw thenable;
	}
	function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
		var type = typeof children;
		if ("undefined" === type || "boolean" === type) children = null;
		var invokeCallback = !1;
		if (null === children) invokeCallback = !0;
		else switch (type) {
			case "bigint":
			case "string":
			case "number":
				invokeCallback = !0;
				break;
			case "object": switch (children.$$typeof) {
				case REACT_ELEMENT_TYPE:
				case REACT_PORTAL_TYPE:
					invokeCallback = !0;
					break;
				case REACT_LAZY_TYPE: return invokeCallback = children._init, mapIntoArray(invokeCallback(children._payload), array, escapedPrefix, nameSoFar, callback);
			}
		}
		if (invokeCallback) return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
			return c;
		})) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(callback, escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(userProvidedKeyEscapeRegex, "$&/") + "/") + invokeCallback)), array.push(callback)), 1;
		invokeCallback = 0;
		var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
		if (isArrayImpl(children)) for (var i = 0; i < children.length; i++) nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
		else if (i = getIteratorFn(children), "function" === typeof i) for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done;) nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
		else if ("object" === type) {
			if ("function" === typeof children.then) return mapIntoArray(resolveThenable(children), array, escapedPrefix, nameSoFar, callback);
			array = String(children);
			throw Error("Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead.");
		}
		return invokeCallback;
	}
	function mapChildren(children, func, context) {
		if (null == children) return children;
		var result = [], count = 0;
		mapIntoArray(children, result, "", "", function(child) {
			return func.call(context, child, count++);
		});
		return result;
	}
	function lazyInitializer(payload) {
		if (-1 === payload._status) {
			var ctor = payload._result;
			ctor = ctor();
			ctor.then(function(moduleObject) {
				if (0 === payload._status || -1 === payload._status) payload._status = 1, payload._result = moduleObject;
			}, function(error) {
				if (0 === payload._status || -1 === payload._status) payload._status = 2, payload._result = error;
			});
			-1 === payload._status && (payload._status = 0, payload._result = ctor);
		}
		if (1 === payload._status) return payload._result.default;
		throw payload._result;
	}
	var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
		if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
			var event = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
				error
			});
			if (!window.dispatchEvent(event)) return;
		} else if ("object" === typeof process && "function" === typeof process.emit) {
			process.emit("uncaughtException", error);
			return;
		}
		console.error(error);
	}, Children = {
		map: mapChildren,
		forEach: function(children, forEachFunc, forEachContext) {
			mapChildren(children, function() {
				forEachFunc.apply(this, arguments);
			}, forEachContext);
		},
		count: function(children) {
			var n = 0;
			mapChildren(children, function() {
				n++;
			});
			return n;
		},
		toArray: function(children) {
			return mapChildren(children, function(child) {
				return child;
			}) || [];
		},
		only: function(children) {
			if (!isValidElement(children)) throw Error("React.Children.only expected to receive a single React element child.");
			return children;
		}
	};
	exports.Activity = REACT_ACTIVITY_TYPE;
	exports.Children = Children;
	exports.Component = Component;
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.Profiler = REACT_PROFILER_TYPE;
	exports.PureComponent = PureComponent;
	exports.StrictMode = REACT_STRICT_MODE_TYPE;
	exports.Suspense = REACT_SUSPENSE_TYPE;
	exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
	exports.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(size) {
			return ReactSharedInternals.H.useMemoCache(size);
		}
	};
	exports.cache = function(fn) {
		return function() {
			return fn.apply(null, arguments);
		};
	};
	exports.cacheSignal = function() {
		return null;
	};
	exports.cloneElement = function(element, config, children) {
		if (null === element || void 0 === element) throw Error("The argument must be a React element, but you passed " + element + ".");
		var props = assign({}, element.props), key = element.key;
		if (null != config) for (propName in void 0 !== config.key && (key = "" + config.key), config) !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
		var propName = arguments.length - 2;
		if (1 === propName) props.children = children;
		else if (1 < propName) {
			for (var childArray = Array(propName), i = 0; i < propName; i++) childArray[i] = arguments[i + 2];
			props.children = childArray;
		}
		return ReactElement(element.type, key, props);
	};
	exports.createContext = function(defaultValue) {
		defaultValue = {
			$$typeof: REACT_CONTEXT_TYPE,
			_currentValue: defaultValue,
			_currentValue2: defaultValue,
			_threadCount: 0,
			Provider: null,
			Consumer: null
		};
		defaultValue.Provider = defaultValue;
		defaultValue.Consumer = {
			$$typeof: REACT_CONSUMER_TYPE,
			_context: defaultValue
		};
		return defaultValue;
	};
	exports.createElement = function(type, config, children) {
		var propName, props = {}, key = null;
		if (null != config) for (propName in void 0 !== config.key && (key = "" + config.key), config) hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
		var childrenLength = arguments.length - 2;
		if (1 === childrenLength) props.children = children;
		else if (1 < childrenLength) {
			for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++) childArray[i] = arguments[i + 2];
			props.children = childArray;
		}
		if (type && type.defaultProps) for (propName in childrenLength = type.defaultProps, childrenLength) void 0 === props[propName] && (props[propName] = childrenLength[propName]);
		return ReactElement(type, key, props);
	};
	exports.createRef = function() {
		return { current: null };
	};
	exports.forwardRef = function(render) {
		return {
			$$typeof: REACT_FORWARD_REF_TYPE,
			render
		};
	};
	exports.isValidElement = isValidElement;
	exports.lazy = function(ctor) {
		return {
			$$typeof: REACT_LAZY_TYPE,
			_payload: {
				_status: -1,
				_result: ctor
			},
			_init: lazyInitializer
		};
	};
	exports.memo = function(type, compare) {
		return {
			$$typeof: REACT_MEMO_TYPE,
			type,
			compare: void 0 === compare ? null : compare
		};
	};
	exports.startTransition = function(scope) {
		var prevTransition = ReactSharedInternals.T, currentTransition = {};
		ReactSharedInternals.T = currentTransition;
		try {
			var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
			null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
			"object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
		} catch (error) {
			reportGlobalError(error);
		} finally {
			null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
		}
	};
	exports.unstable_useCacheRefresh = function() {
		return ReactSharedInternals.H.useCacheRefresh();
	};
	exports.use = function(usable) {
		return ReactSharedInternals.H.use(usable);
	};
	exports.useActionState = function(action, initialState, permalink) {
		return ReactSharedInternals.H.useActionState(action, initialState, permalink);
	};
	exports.useCallback = function(callback, deps) {
		return ReactSharedInternals.H.useCallback(callback, deps);
	};
	exports.useContext = function(Context) {
		return ReactSharedInternals.H.useContext(Context);
	};
	exports.useDebugValue = function() {};
	exports.useDeferredValue = function(value, initialValue) {
		return ReactSharedInternals.H.useDeferredValue(value, initialValue);
	};
	exports.useEffect = function(create, deps) {
		return ReactSharedInternals.H.useEffect(create, deps);
	};
	exports.useEffectEvent = function(callback) {
		return ReactSharedInternals.H.useEffectEvent(callback);
	};
	exports.useId = function() {
		return ReactSharedInternals.H.useId();
	};
	exports.useImperativeHandle = function(ref, create, deps) {
		return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
	};
	exports.useInsertionEffect = function(create, deps) {
		return ReactSharedInternals.H.useInsertionEffect(create, deps);
	};
	exports.useLayoutEffect = function(create, deps) {
		return ReactSharedInternals.H.useLayoutEffect(create, deps);
	};
	exports.useMemo = function(create, deps) {
		return ReactSharedInternals.H.useMemo(create, deps);
	};
	exports.useOptimistic = function(passthrough, reducer) {
		return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
	};
	exports.useReducer = function(reducer, initialArg, init) {
		return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
	};
	exports.useRef = function(initialValue) {
		return ReactSharedInternals.H.useRef(initialValue);
	};
	exports.useState = function(initialState) {
		return ReactSharedInternals.H.useState(initialState);
	};
	exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
		return ReactSharedInternals.H.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
	};
	exports.useTransition = function() {
		return ReactSharedInternals.H.useTransition();
	};
	exports.version = "19.2.7";
}));
//#endregion
//#region node_modules/react/index.js
var require_react = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_production();
}));
//#endregion
//#region node_modules/@ckeditor/ckeditor5-react/dist/index.js
var dist_exports = /* @__PURE__ */ __exportAll({
	CKEditor: () => CKEditor,
	ContextWatchdogContext: () => ContextWatchdogContext
});
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
	enumerable: true,
	configurable: true,
	writable: true,
	value
}) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var _LifeCycleElementSemaphore = class _LifeCycleElementSemaphore {
	constructor(element, lifecycle) {
		/**
		* This should define async methods for initializing and destroying the editor.
		* Essentially, it's an async version of basic React lifecycle methods like `componentDidMount`, `componentWillUnmount`.
		*
		* 	* Result of {@link LifeCycleAsyncOperators#mount} method is passed to {@link LifeCycleAsyncOperators#unmount} as an argument.
		*/
		__publicField(this, "_lifecycle");
		/**
		* This is the element instance that the editor uses for mounting. This element should contain the `ckeditorInstance` member
		* once the editor has been successfully mounted to it. The semaphore ensures that a new instance of the editor, which will
		* be assigned to this element by the {@link #_lifecycle:mount} method, will always be initialized after the successful
		* destruction of the underlying `ckeditorInstance` that was previously mounted on this element.
		*/
		__publicField(this, "_element");
		/**
		* This is the lock mechanism utilized by the {@link #lock} and {@link #release} methods.
		*
		* 	* If the editor is not yet mounted and is awaiting mounting (for instance, when another editor is
		* 	  occupying the element), then it is null.
		*
		* 	* When the editor is mounted on the element, this variable holds an unresolved promise that will be
		* 	  resolved after the editor is destroyed.
		*
		* 	* Once the editor is destroyed (and it was previously mounted), the promise is resolved.
		*/
		__publicField(this, "_releaseLock", null);
		/**
		* This is the result of the {@link #_lifecycle:mount} function. This value should be reset to `null`
		* once the semaphore is released. It is utilized to store certain data that must be removed following
		* the destruction of the editor. This data may include the editor's instance, the assigned watchdog,
		* or handles for additional window listeners.
		*/
		__publicField(this, "_value", null);
		/**
		* This is a list of callbacks that are triggered if the semaphore {@link #_lifecycle:mount} method executes successfully.
		* It is utilized in scenarios where we need to assign certain properties to an editor that is currently in the process of mounting.
		* An instance of such usage could be two-way binding. We aim to prevent the loss of all `setData` calls if the editor has not
		* yet been mounted, therefore these calls will be executed immediately following the completion of the mounting process.
		*/
		__publicField(this, "_afterMountCallbacks", []);
		/**
		* This represents the actual mounting state of the semaphore. It is primarily used by the {@link #release} method to
		* determine whether the initialization of the editor should be skipped or, if the editor is already initialized, the editor
		* should be destroyed.
		*
		* 	* If `destroyedBeforeInitialization` is true, then the {@link #release} method was invoked before the editor began to mount.
		* 	  This often occurs in strict mode when we assign a promise to the {@link LifeCycleEditorElementSemaphore#_semaphores} map
		* 	  and the assigned `mount` callback has not yet been called. In this scenario, it is safe to skip the initialization of the editor
		* 	  and simply release the semaphore.
		*
		*	* If `mountingInProgress` is a Promise, then the {@link #release} method was invoked after the initialization of the editor and
		the editor must be destroyed before the semaphore is released.
		*/
		__publicField(this, "_state", {
			destroyedBeforeInitialization: false,
			mountingInProgress: null
		});
		/**
		* Inverse of {@link #_lock} method that tries to destroy attached editor.
		*
		* 	* If editor is being already attached to element (or is in attaching process) then after fully initialization of editor
		* 	  destroy is performed and semaphore is released. The {@link #_lifecycle} unmount method is called.
		*
		* 	* If editor is being destroyed before initialization then it does nothing but sets `destroyedBeforeInitialization` flag that
		* 	  will be later checked by {@link #_lock} method in initialization. The {@link #_lifecycle} unmount method is not called.
		*
		* *Important note:*
		*
		* It’s really important to keep this method *sync*. If we make this method *async*, it won’t work well because
		* it will cause problems when we’re trying to set up the {@link LifeCycleEditorElementSemaphore#_semaphores} map entries.
		*/
		__publicField(this, "release", once(() => {
			const { _releaseLock, _state, _element, _lifecycle } = this;
			if (_state.mountingInProgress) _state.mountingInProgress.then(() => _lifecycle.unmount({
				element: _element,
				mountResult: this.value
			})).catch((error) => {
				console.error("CKEditor unmounting error:", error);
			}).then(_releaseLock.resolve).then(() => {
				this._value = null;
			});
			else {
				_state.destroyedBeforeInitialization = true;
				_releaseLock.resolve();
			}
		}));
		this._element = element;
		this._lifecycle = lifecycle;
		this._lock();
	}
	/**
	* Getter for {@link #_value}.
	*/
	get value() {
		return this._value;
	}
	/**
	* Resets the semaphore to its initial state.
	*/
	discard() {
		this._value = null;
		this._releaseLock = null;
		this._afterMountCallbacks = [];
		this._state = {
			destroyedBeforeInitialization: false,
			mountingInProgress: null
		};
	}
	/**
	* Occasionally, the Watchdog restarts the editor instance, resulting in a new instance being assigned to the semaphore.
	* In terms of race conditions, it's generally safer to simply override the semaphore value rather than recreating it
	* with a different one.
	*/
	unsafeSetValue(value) {
		this._value = value;
		this._afterMountCallbacks.forEach((callback) => {
			if (this._lifecycle.isValueValid && !this._lifecycle.isValueValid(value)) return;
			callback(value);
		});
		this._afterMountCallbacks = [];
	}
	/**
	* This registers a callback that will be triggered after the editor has been successfully mounted.
	*
	* 	* If the editor is already mounted, the callback will be executed immediately.
	*	* If the editor is in the process of mounting, the callback will be executed upon successful mounting.
	* 	* If the editor is never mounted, the passed callback will not be executed.
	* 	* If an exception is thrown within the callback, it will be re-thrown in the semaphore.
	* 	* If the value is not valid (determined by isValueValid), the callback will not be executed.
	*/
	runAfterMount(callback) {
		const { _value, _afterMountCallbacks } = this;
		if (_value) {
			if (this._lifecycle.isValueValid && !this._lifecycle.isValueValid(_value)) return;
			callback(_value);
		} else _afterMountCallbacks.push(callback);
	}
	/**
	* This method is used to inform other components that the {@link #_element} will be used by the editor,
	* which is initialized by the {@link #_lifecycle} methods.
	*
	* 	* If an editor is already present on the provided element, the initialization of the current one
	* 	  will be postponed until the previous one is destroyed.
	*
	* 	* If the element is empty and does not have an editor attached to it, the currently locked editor will
	* 	  be mounted immediately.
	*
	* After the successful initialization of the editor and the assignment of the {@link #_value} member,
	* the `onReady` lifecycle method is called.
	*
	* *Important note:*
	*
	* It’s really important to keep this method *sync*. If we make this method *async*, it won’t work well because
	* it will cause problems when we’re trying to set up the {@link LifeCycleEditorElementSemaphore#_semaphores} map entries.
	*/
	_lock() {
		const { _semaphores } = _LifeCycleElementSemaphore;
		const { _state, _element, _lifecycle } = this;
		const prevElementSemaphore = _semaphores.get(_element) || Promise.resolve(null);
		const releaseLock = createDefer();
		this._releaseLock = releaseLock;
		const newElementSemaphore = prevElementSemaphore.then(() => {
			if (_state.destroyedBeforeInitialization) return Promise.resolve(void 0);
			_state.mountingInProgress = _lifecycle.mount().then((mountResult) => {
				if (mountResult) this.unsafeSetValue(mountResult);
				return mountResult;
			});
			return _state.mountingInProgress;
		}).then(async (mountResult) => {
			if (mountResult && _lifecycle.afterMount) await _lifecycle.afterMount({
				element: _element,
				mountResult
			});
		}).then(() => releaseLock.promise).catch((error) => {
			console.error("CKEditor mounting error:", error);
		}).then(() => {
			if (_semaphores.get(_element) === newElementSemaphore) _semaphores.delete(_element);
		});
		_semaphores.set(_element, newElementSemaphore);
	}
};
/**
* This is a map of elements associated with promises. It informs the semaphore that the underlying HTML element, used as a key,
* is currently in use by another editor. Each element is assigned a promise, which allows for the easy chaining of new
* editor instances on an element that is already in use by another instance. The process works as follows:
*
* 	1. If an element is being used by an editor, then the initialization of a new editor
* 	   instance is chained using the `.then()` method of the Promise.
*
* 	2. If the editor associated with the underlying element is destroyed, then `Promise.resolve()` is called
* 	   and the previously assigned `.then()` editor callback is executed.
*
*  @see {@link #lock} for more detailed information on the implementation.
*/
__publicField(_LifeCycleElementSemaphore, "_semaphores", /* @__PURE__ */ new Map());
var LifeCycleElementSemaphore = _LifeCycleElementSemaphore;
var ReactContextMetadataKey = "$__CKEditorReactContextMetadata";
function withCKEditorReactContextMetadata(metadata, config) {
	return {
		...config,
		[ReactContextMetadataKey]: metadata
	};
}
var ContextWatchdogContext = import_react.createContext(null);
var isContextWatchdogValue = (obj) => !!obj && typeof obj === "object" && "status" in obj && [
	"initializing",
	"initialized",
	"error"
].includes(obj.status);
var isContextWatchdogValueWithStatus = (status) => (obj) => isContextWatchdogValue(obj) && obj.status === status;
var isContextWatchdogInitializing = isContextWatchdogValueWithStatus("initializing");
var isContextWatchdogReadyToUse = (obj) => isContextWatchdogValueWithStatus("initialized")(obj) && obj.watchdog.state === "ready";
var ReactIntegrationUsageDataPlugin = createIntegrationUsageDataPlugin("react", {
	version: "11.2.0",
	frameworkVersion: "19.2.7"
});
function appendAllIntegrationPluginsToConfig(editorConfig) {
	if (isCKEditorFreeLicense(editorConfig.licenseKey)) return editorConfig;
	return appendExtraPluginsToEditorConfig(editorConfig, [ReactIntegrationUsageDataPlugin]);
}
var EditorWatchdogAdapter = class {
	/**
	* @param contextWatchdog The context watchdog instance that will be wrapped into editor watchdog API.
	*/
	constructor(contextWatchdog) {
		/**
		* The context watchdog instance that will be wrapped into editor watchdog API.
		*/
		__publicField(this, "_contextWatchdog");
		/**
		* A unique id for the adapter to distinguish editor items when using the context watchdog API.
		*/
		__publicField(this, "_id");
		/**
		* A watchdog's editor creator function.
		*/
		__publicField(this, "_creator");
		this._contextWatchdog = contextWatchdog;
		this._id = uid();
	}
	/**
	*  @param creator A watchdog's editor creator function.
	*/
	setCreator(creator) {
		this._creator = creator;
	}
	create(sourceElementOrDataOrConfig, config) {
		let watchdogItemConfiguration = {
			creator: this._creator,
			id: this._id,
			type: "editor"
		};
		if (config) watchdogItemConfiguration = {
			...watchdogItemConfiguration,
			sourceElementOrData: sourceElementOrDataOrConfig,
			config
		};
		else watchdogItemConfiguration = {
			...watchdogItemConfiguration,
			config: sourceElementOrDataOrConfig
		};
		return this._contextWatchdog.add(watchdogItemConfiguration);
	}
	/**
	* Creates a listener that is attached to context watchdog's item and run when the context watchdog fires.
	* Currently works only for the `error` event.
	*/
	on(_, callback) {
		this._contextWatchdog.on("itemError", (_2, { itemId, error }) => {
			if (itemId === this._id) callback(null, {
				error,
				causesRestart: void 0
			});
		});
	}
	destroy() {
		if (this._contextWatchdog.state === "ready") return this._contextWatchdog.remove(this._id);
		return Promise.resolve();
	}
	/**
	* An editor instance.
	*/
	get editor() {
		return this._contextWatchdog.getItem(this._id);
	}
};
function normalizeClassList(classes) {
	if (typeof classes === "string") return classes;
	return (classes != null ? classes : []).join(" ");
}
function normalizeStylesMap(styles) {
	return mapObjectKeys(styles, (key) => {
		if (key.startsWith("--")) return key;
		return kebabToCamelCase(key);
	});
}
function normalizeEditorElementDefinition(definition) {
	if (typeof HTMLElement !== "undefined" && definition instanceof HTMLElement) throw new Error("An HTMLElement cannot be used as an editor element definition. Please pass a string, a React component, or an object definition.");
	if (typeof definition !== "object" || definition === null) return { name: definition };
	return definition;
}
var EditorElement = (0, import_react.memo)((0, import_react.forwardRef)(({ definition }, ref) => {
	const { name: Tag, classes, styles, attributes } = normalizeEditorElementDefinition(definition != null ? definition : { name: "div" });
	return /* @__PURE__ */ import_react.createElement(Tag, {
		ref,
		...attributes,
		style: normalizeStylesMap(styles != null ? styles : {}),
		className: normalizeClassList(classes)
	});
}));
EditorElement.displayName = "EditorElement";
var REACT_INTEGRATION_READ_ONLY_LOCK_ID$1 = "Lock from React integration (@ckeditor/ckeditor5-react)";
var CKEditor = class extends import_react.Component {
	constructor(props) {
		super(props);
		/**
		* After mounting the editor, the variable will contain a reference to the created editor.
		* @see: https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html
		*/
		__publicField(this, "domContainer", import_react.createRef());
		/**
		* Unlocks element in editor semaphore after destroy editor instance.
		*/
		__publicField(this, "editorSemaphore", null);
		assertMinimumSupportedVersion();
	}
	get _semaphoreValue() {
		const { editorSemaphore } = this;
		return editorSemaphore ? editorSemaphore.value : null;
	}
	/**
	* An watchdog instance.
	*/
	get watchdog() {
		const { _semaphoreValue } = this;
		return _semaphoreValue ? _semaphoreValue.watchdog : null;
	}
	/**
	* An editor instance.
	*/
	get editor() {
		const { _semaphoreValue } = this;
		return _semaphoreValue ? _semaphoreValue.instance : null;
	}
	/**
	* The CKEditor component should not be updated by React itself.
	* However, if the component identifier changes, the whole structure should be created once again.
	*/
	shouldComponentUpdate(nextProps) {
		const { props, editorSemaphore } = this;
		if (nextProps.id !== props.id) return true;
		if (nextProps.disableWatchdog !== props.disableWatchdog) return true;
		if (editorSemaphore) {
			editorSemaphore.runAfterMount(({ instance }) => {
				if (shouldUpdateEditorData(props, nextProps, instance)) instance.data.set(nextProps.data);
			});
			if ("disabled" in nextProps) editorSemaphore.runAfterMount(({ instance }) => {
				if (nextProps.disabled) instance.enableReadOnlyMode(REACT_INTEGRATION_READ_ONLY_LOCK_ID$1);
				else instance.disableReadOnlyMode(REACT_INTEGRATION_READ_ONLY_LOCK_ID$1);
			});
		}
		return false;
	}
	/**
	* Initialize the editor when the component is mounted.
	*/
	componentDidMount() {
		if (!isContextWatchdogInitializing(this.context)) this._initLifeCycleSemaphore();
	}
	/**
	* Re-render the entire component once again. The old editor will be destroyed and the new one will be created.
	*/
	componentDidUpdate() {
		if (!isContextWatchdogInitializing(this.context)) this._initLifeCycleSemaphore();
	}
	/**
	* Destroy the editor before unmounting the component.
	*/
	componentWillUnmount() {
		this._unlockLifeCycleSemaphore();
	}
	/**
	* Async destroy attached editor and unlock element semaphore.
	*/
	_unlockLifeCycleSemaphore() {
		if (this.editorSemaphore) {
			this.editorSemaphore.release();
			this.editorSemaphore = null;
		}
	}
	/**
	* Unlocks previous editor semaphore and creates new one..
	*/
	_initLifeCycleSemaphore() {
		this._unlockLifeCycleSemaphore();
		this.editorSemaphore = new LifeCycleElementSemaphore(this.domContainer.current, {
			isValueValid: (value) => value && !!value.instance,
			mount: async () => {
				var _a, _b;
				try {
					return await this._initializeEditor();
				} catch (error) {
					(_b = (_a = this.props).onError) == null || _b.call(_a, error, {
						phase: "initialization",
						willEditorRestart: false
					});
					throw error;
				}
			},
			afterMount: ({ mountResult }) => {
				const { onReady } = this.props;
				if (onReady && this.domContainer.current !== null) onReady(mountResult.instance);
			},
			unmount: async ({ element, mountResult }) => {
				const { onAfterDestroy } = this.props;
				try {
					await this._destroyEditor(mountResult);
					element.innerHTML = "";
				} finally {
					if (onAfterDestroy) onAfterDestroy(mountResult.instance);
				}
			}
		});
	}
	/**
	* Render a <div> element which will be replaced by CKEditor.
	*/
	render() {
		const { editor: Editor, config = {} } = this.props;
		const definition = getEditorElementDefinition(Editor, config);
		return /* @__PURE__ */ import_react.createElement(EditorElement, {
			ref: this.domContainer,
			definition
		});
	}
	/**
	* Initializes the editor by creating a proper watchdog and initializing it with the editor's configuration.
	*/
	async _initializeEditor() {
		const supports = getInstalledCKBaseFeatures();
		const { editor: Editor, disableWatchdog, watchdogConfig } = this.props;
		const mergedConfig = this._getMergedConfig(true);
		if (disableWatchdog) return {
			instance: await this._createEditor(mergedConfig),
			watchdog: null
		};
		const watchdog = (() => {
			if (isContextWatchdogReadyToUse(this.context)) return new EditorWatchdogAdapter(this.context.watchdog);
			return new Editor.EditorWatchdog(Editor, watchdogConfig);
		})();
		watchdog.on("error", (_, { error, causesRestart }) => {
			var _a;
			((_a = this.props.onError) != null ? _a : console.error)(error, {
				phase: "runtime",
				willEditorRestart: causesRestart
			});
		});
		if (supports.elementConfigAttachment) {
			watchdog.setCreator(async (config) => this._watchdogCreateEditor(watchdog, config));
			await watchdog.create(mergedConfig);
		} else {
			watchdog.setCreator(async (_, config) => this._watchdogCreateEditor(watchdog, config));
			await watchdog.create(this.domContainer.current, mergedConfig);
		}
		return {
			watchdog,
			instance: watchdog.editor
		};
	}
	/**
	* Creates editor in watchdog context.
	*
	* @param watchdog Watchdog adapter.
	* @param config Editor configuration.
	* @returns Editor instance.
	*/
	async _watchdogCreateEditor(watchdog, config) {
		const { editorSemaphore } = this;
		const { onAfterDestroy, onReady } = this.props;
		const nonFirstCreate = !!(editorSemaphore == null ? void 0 : editorSemaphore.value);
		if (nonFirstCreate && onAfterDestroy) onAfterDestroy(editorSemaphore.value.instance);
		const instance = await this._createEditor(config);
		if (nonFirstCreate && editorSemaphore) {
			editorSemaphore.unsafeSetValue({
				instance,
				watchdog
			});
			setTimeout(() => {
				onReady?.(watchdog.editor);
			});
		}
		return instance;
	}
	/**
	* Creates an editor from the element and configuration.
	*
	* @param config CKEditor 5 editor configuration.
	* @returns Editor instance.
	*/
	async _createEditor(config) {
		const { editor: Editor } = this.props;
		const supports = getInstalledCKBaseFeatures();
		const mergedConfig = this._getMergedConfig(false, config);
		const editor = await (supports.elementConfigAttachment ? Editor.create(mergedConfig) : Editor.create(this.domContainer.current, mergedConfig));
		if (this.props.disabled) editor.enableReadOnlyMode(REACT_INTEGRATION_READ_ONLY_LOCK_ID$1);
		const modelDocument = editor.model.document;
		const viewDocument = editor.editing.view.document;
		modelDocument.on("change:data", (event) => {
			var _a, _b;
			(_b = (_a = this.props).onChange) == null || _b.call(_a, event, editor);
		});
		viewDocument.on("focus", (event) => {
			var _a, _b;
			(_b = (_a = this.props).onFocus) == null || _b.call(_a, event, editor);
		});
		viewDocument.on("blur", (event) => {
			var _a, _b;
			(_b = (_a = this.props).onBlur) == null || _b.call(_a, event, editor);
		});
		return editor;
	}
	/**
	* It gets an extended configuration containing the entries required for the integration configuration.
	*
	* @param resetData Assigns `data` prop value to the configuration if true.
	* @param config The configuration of the editor.
	* @returns Shallow copy of config.
	*/
	_getMergedConfig(resetData, config) {
		const { contextItemMetadata, editor: Editor } = this.props;
		const supports = getInstalledCKBaseFeatures();
		let mappedConfig = { ...config != null ? config : this.props.config };
		if (contextItemMetadata) mappedConfig = withCKEditorReactContextMetadata(contextItemMetadata, mappedConfig);
		mappedConfig = appendAllIntegrationPluginsToConfig(mappedConfig);
		if (supports.elementConfigAttachment) mappedConfig = assignElementToEditorConfig(Editor, this.domContainer.current, mappedConfig);
		if (resetData) mappedConfig = assignInitialDataToEditorConfig(mappedConfig, this.props.data || "");
		return mappedConfig;
	}
	/**
	* Destroys the editor by destroying the watchdog.
	*/
	async _destroyEditor(initializeResult) {
		const { watchdog, instance } = initializeResult;
		return new Promise((resolve, reject) => {
			setTimeout(async () => {
				try {
					if (watchdog) {
						await watchdog.destroy();
						return resolve();
					}
					if (instance) {
						await instance.destroy();
						return resolve();
					}
					resolve();
				} catch (e) {
					console.error(e);
					reject(e);
				}
			});
		});
	}
};
__publicField(CKEditor, "contextType", ContextWatchdogContext);
function getEditorElementDefinition(editor, config) {
	var _a, _b, _c, _d, _e;
	if (!editor.editorName || editor.editorName === "ClassicEditor") return "div";
	return (_e = (_d = (_b = (_a = config.roots) == null ? void 0 : _a.main) == null ? void 0 : _b.element) != null ? _d : (_c = config.root) == null ? void 0 : _c.element) != null ? _e : "div";
}
function shouldUpdateEditorData(prevProps, nextProps, editor) {
	if (prevProps.data === nextProps.data) return false;
	if (editor.data.get() === nextProps.data) return false;
	return true;
}
function assertMinimumSupportedVersion() {
	switch (compareInstalledCKBaseVersion("42.0.0")) {
		case null:
			console.warn("Cannot find the \"CKEDITOR_VERSION\" in the \"window\" scope.");
			break;
		case -1:
			console.warn("The <CKEditor> component requires using CKEditor 5 in version 42+ or nightly build.");
			break;
	}
}
function mergeRefs(...refs) {
	return (value) => {
		refs.forEach((ref) => {
			if (typeof ref === "function") ref(value);
			else if (ref != null) ref.current = value;
		});
	};
}
var EditorToolbarWrapper = (0, import_react.forwardRef)(({ editor }, ref) => {
	const toolbarRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const toolbarContainer = toolbarRef.current;
		if (!editor || !toolbarContainer) return;
		const element = editor.ui.view.toolbar.element;
		toolbarContainer.appendChild(element);
		return () => {
			if (toolbarContainer.contains(element)) toolbarContainer.removeChild(element);
		};
	}, [editor]);
	return /* @__PURE__ */ import_react.createElement("div", { ref: mergeRefs(toolbarRef, ref) });
});
EditorToolbarWrapper.displayName = "EditorToolbarWrapper";
var ROOT_EDITABLE_OPTIONS_ATTRIBUTE = "$rootEditableOptions";
var EditorEditable = (0, import_react.memo)((0, import_react.forwardRef)(({ id, editor, rootName }, ref) => {
	var _a;
	const innerRef = (0, import_react.useRef)(null);
	const root = (0, import_react.useMemo)(() => editor == null ? void 0 : editor.model.document.getRoot(rootName), [editor, rootName]);
	const rootEditableOptions = (0, import_react.useMemo)(() => {
		if (!root) return null;
		return { ...root.getAttribute(ROOT_EDITABLE_OPTIONS_ATTRIBUTE) };
	}, [root]);
	(0, import_react.useEffect)(() => {
		if (!editor || !root || !rootEditableOptions) return;
		if (editor.ui.getEditableElement(rootName)) editor.detachEditable(root);
		const editable = editor.ui.view.createEditable(rootName, innerRef.current, rootEditableOptions.label);
		editable.isInlineRoot = !editor.model.schema.checkChild(root, "$block");
		editor.ui.addEditable(editable, rootEditableOptions.placeholder);
		editor.editing.view.forceRender();
		return () => {
			if (editor && editor.state !== "destroyed") {
				if (editor.model.document.getRoot(rootName) === root) editor.detachEditable(root);
			}
		};
	}, [
		editor,
		root,
		rootEditableOptions
	]);
	if (!rootEditableOptions) return null;
	let normalizedDefinition = normalizeEditorElementDefinition((_a = rootEditableOptions == null ? void 0 : rootEditableOptions.element) != null ? _a : { name: "div" });
	normalizedDefinition = {
		...normalizedDefinition,
		attributes: {
			...normalizedDefinition.attributes,
			id
		}
	};
	return /* @__PURE__ */ import_react.createElement(EditorElement, {
		key: editor == null ? void 0 : editor.id,
		ref: mergeRefs(ref, innerRef),
		definition: normalizedDefinition
	});
}));
EditorEditable.displayName = "EditorEditable";
//#endregion
export { require_react as n, dist_exports as t };
