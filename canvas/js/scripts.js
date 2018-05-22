function randomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1)
    rand = Math.round(rand);
    return rand;
}
function randomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function onClick(e) {
    const point = getCanvasCursorPosition(e);
    console.log(point);
}
function getCanvasCursorPosition(e) {
    let x, y;
    if (typeof e.offsetX !== 'undefined' && typeof e.offsetY !== 'undefined') {
        x = e.offsetX;
        y = e.offsetY;
    }
    let canvas = e.path[0];
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;
    return [x,y];
}
function clearRect (canvasObj = document.querySelector('#canvasId'), width, height){
    const canvas = canvasObj.getContext('2d');
    canvas.clearRect(0,0,width,height);
}
function clearAll (canvasObj = document.querySelector('#canvasId')){
    const canvas = canvasObj.getContext('2d');
    let width = canvasObj.offsetWidth;
    let height = canvasObj.offsetHeight;
    canvas.clearRect(0,0,width,height);
}
function animate() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = getRandomColor();
    ctx.clearRect(320, 0, 20, canvas.clientHeight);
    ctx.fillRect(320, currentPos, 20, 20);
    currentPos += 1;
    if (currentPos >= canvas.clientHeight) {
        currentPos = -20;
    }
    requestAnimationFrame(animate);
}
function createApp () {
    function gameElement (x, y, width, height, name, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this._name = name;
        this._color = color;
        
        return this;
    }
    
    gameElement.prototype = {
        constructor: gameElement,
        make: function (x, y, width, height, name) {
            return this.constructor.apply(this, arguments);
        },
        isHavePoint: function (x, y) {
            if (x < this.x && x < (this.x + this.width)) {
                if (y < this.y && y < (this.y + this.height)) {
                    return true;
                }
            }
        },
        move: function (x, y) {
            this.x += x;
            this.y += y;
            
            return this;
        },
        resize: function (width, height) {
            this.width = width;
            this.height = height;
    
            return this;
        }
    };
    
    window.app = {
        props: {},
        methods: {},
        container: {},
        button: {},
        pushCanvas: function () {
            this.container.appendChild(this.canvas);
        },
        pushButton: function () {
            this.button = document.createElement('button');
            this.button.setAttribute('id', 'start');
            this.button.innerHTML = 'Start!';
            this.container.appendChild(this.button);
        },
        initialize: function () {
            this.container = document.querySelector('#app');
            this.canvas = document.createElement('canvas');
            this.canvas.setAttribute('id', 'canvasId');
            this.context = this.canvas.getContext('2d');
            
            this.pushCanvas();
            this.pushButton();
            this.methods.resize();
        }
    };
    
    const app = window.app;
    
    app.props = {
        width: 0,
        height: 0,
        canvWidth: 0,
        canvHeight: 0,
        elems: {
            collection: [],
            get: function (name) {
                let elem;
                this.collection.map((el)=>{
                    if (el._name === name) {
                        elem = el;
                    }
                });
                
                return elem ? elem : console.warn(`Elem ${name} not found!`);
            }
        },
        events: []
    };
    
    app.methods = {
        resize: function () {
            app.props.canvHeight = parseInt(app.container.offsetHeight) - parseInt(app.container.offsetHeight) / 10;
            if (app.props.canvHeight < 600) {
                app.props.canvHeight = 600;
            }
            app.props.canvWidth = parseInt(app.container.offsetWidth);
            app.props.width = parseInt(app.container.offsetWidth);
            app.props.height = parseInt(app.container.offsetHeight);
            
            app.canvas.setAttribute('style', 'height: ' + app.props.canvHeight + 'px;');
        },
        setListener: function (event, elem, handler) {
            app.props.events.push([handler.name, event, handler]);
            elem.addEventListener(event, handler, false);
        },
        removeListener: function (elem, handlerName) {
            app.props.events.map((event, index) => {
                let name = event[0],
                    type = event[1],
                    handler = event[2];
                if (name === handlerName) {
                    elem.removeEventListener(type, handler);
                    app.props.events.slice(index, 1);
                }
            });
        },
        makeGameElem: function (x, y, width, height, number) {
            let elem = new gameElement(x, y, width, height, number, randomColor());
            app.props.elems.collection.push(elem);
        },
        destroyGameElem: function (number) {
            app.props.elems.collection.map((elem, index)=>{
                if (elem._name === number) {
                    app.props.elems.collection.splice(index, 1);
                }
                else {
                    console.warn(`Destroy failed, elem ${number} is undefined!`);
                }
            });
        },
        destroyGameElems: function () {
            app.props.elems.collection = [];
        },
        drawElems: function (isRedraw) {
            isRedraw && clearAll();
            const ctx = app.context;
            app.props.elems.collection.map((elem)=>{
                ctx.fillStyle = elem._color;
                ctx.fillRect(elem.x, elem.y, elem.width, elem.height);
            });
        },
        gameIteration: function () {
            app.methods.drawElems(true);
            let el = app.props.elems.get(0);
            app.props.elems.get(0).move(0, 1);
            if (el.y >= app.canvas.height) {
                app.methods.destroyGameElems();
                app.methods.makeGameElem(randomInteger(0, 100), 0, 3, 3, 0);
            }
            requestAnimationFrame(app.methods.gameIteration);
        },
        startGame: function () {
            app.methods.makeGameElem(5, 0, 3, 3, 0);
            requestAnimationFrame(app.methods.gameIteration);
        }
    };
    
    app.initialize();
    window.onresize = app.methods.resize.bind(window.app);
    
    app.setLogic = (function () {
        app.methods.setListener('click', app.canvas, onClick);
    })();
}

window.onload = createApp;