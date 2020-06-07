var canvas, ctx, figures = [], idTimer;
var is_pushed = false;
var N = 40;

function random_color() {
    return 'rgb(' + Math.floor(Math.random() * 256) + ',' +
        Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ')';
};

function randomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min));
}
Figure = new Class({
    initialize: function(pX, pY) {
        this.posX = pX; // позиция фигуры по X
        this.posY = pY; // позиция фигуры по Y
        this.color = random_color(); // случайный цвет фигуры
        this.size = randomInt(5, 31); // случайный размер фигуры от 5 до 3
    },
    up: function() {
        this.dirX = 0;
        this.dirY = -1;
    },
    down: function() {
        this.dirX = 0;
        this.dirY = 1;
    },
    left: function() {
        this.dirX = -1;
        this.dirY = 0;
    },
    right: function() {
        this.dirX = 1;
        this.dirY = 0;
    },
    posX: 0,
    posY: 0,
    size: 0,
    speed: 0,
    color: "rgb(0,0,0)",
    dirX: 0,
    dirY: 0,
});
Ball = new Class({
    Extends: Figure,
    draw: function(ctx) {
        with(this) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(posX, posY, size, 0, 2 * Math.PI, false);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        }
    }
});
Square = new Class({
    Extends: Figure,
    draw: function(ctx) {
        with(this) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(posX + size, posY + size);
            ctx.lineTo(posX + size, posY - size);
            ctx.lineTo(posX - size, posY - size);
            ctx.lineTo(posX - size, posY + size);
            ctx.lineTo(posX + size, posY + size);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        }
    }
});
triangle = new Class({
    Extends: Figure,
    draw: function(ctx) {
        with(this) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(posX, posY);
            ctx.lineTo(posX + size / 2, posY + size);
            ctx.lineTo(posX - size / 2, posY + size);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        }
    }
})

function drawBack(ctx, col1, col2, w, h) {
    // закрашиваем канвас градиентным фоном
    ctx.save();
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(1, col1);
    g.addColorStop(0, col2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
}
// инициализация работы
function init() {
    canvas = document.getElementById('canvas');
    if (canvas.getContext) {
        ctx = canvas.getContext('2d');
        //рисуем фон
        drawBack(ctx, '#202020', '#aaa', canvas.width, canvas.height);
        for (var i = 1; i <= 10; i++) {
            randomFigure(10 + Math.random() * (canvas.width - 30),
                10 + Math.random() * (canvas.height - 30));
        }
    }
}

function random_dir_fixed(item) { // рандомное расположение фигур
    rand = randomInt(0, 4);
    if (rand == 0) {
        item.up();
    } else if (rand == 1) {
        item.down();
    } else if (rand == 2) {
        item.left();
    } else {
        item.right();
    }
}

function randomFigure(x, y) {
    rand = randomInt(0, 3);
    if (rand == 0) {
        item = new Ball(x, y);
        item.draw(ctx);
    } else if (rand == 1) {
        item = new Square(x, y);
        item.draw(ctx);
    } else {
        item = new triangle(x, y);
        item.draw(ctx);
    }
    random_dir_fixed(item);
    figures.push(item);
}

function goInput(event) { // появление рандомной фигуры при клике
    var x = event.clientX;
    var y = event.clientY;
    randomFigure(x, y)
}

function move_up() {
    for (var i = 0; i < figures.length; i++) {
        figures[i].up();
    }
}

function move_down() {
    for (var i = 0; i < figures.length; i++) {
        figures[i].down();
    }
}

function move_left() {
    for (var i = 0; i < figures.length; i++) {
        figures[i].left();
    }
}

function move_right() {
    for (var i = 0; i < figures.length; i++) {
        figures[i].right();
    }
}

function move_random() {
    for (var i = 0; i < figures.length; i++) {
        figures[i].dirX = 0;
        figures[i].dirY = 0;
        while (!figures[i].dirX && !figures[i].dirY) {
            figures[i].dirX = randomInt(-1, 2);
            figures[i].dirY = randomInt(-1, 2);
        }
    }
}

function move_chaos() {
    for (var i = 0; i < figures.length; i++) {
        move_random();
    }
    move_all();
    if (!is_pushed) {
        is_pushed = true;
        idTimer = setInterval('move_chaos();', 50);
    }
}

function move_all() {
    drawBack(ctx, '#202020', '#aaa', canvas.width, canvas.height);
    for (var i = 0; i < figures.length; i++) {
        figures[i].posX += 1.5 * figures[i].dirX * figures[i].speed;
        figures[i].posY += 1.5 * figures[i].dirY * figures[i].speed;
        figures[i].speed += 0.05;
        figures[i].size += 0.1;
        figures[i].draw(ctx);
        if ((figures[i].posX < 0) || (figures[i].posX > canvas.width) || (figures[i].posY < 0) || (figures[i].posY > canvas.height) || (figures[i].size > N)) {
            figures.splice(i--, 1);
        } else {
            for (var j = 0; j < figures.length; j++) {
                if (i != j && clash(figures[i], figures[j])) {
                    figures.splice(j--, 1);
                }
            }
        }
    }
}

function clash(figure1, figure2) {
    clashX = false;
    clashY = false;
    if (figure1.posX - figure1.size - figure2.size <= figure2.posX && figure1.posX + figure1.size + figure2.size >= figure2.posX) clashX = true;
    if (figure1.posY - figure1.size - figure2.size <= figure2.posY && figure1.posY + figure1.size + figure2.size >= figure2.posY) clashY = true;
    return clashX && clashY;
}

function stop() {
    clearInterval(idTimer);
    is_pushed = false;
}

function move() {
    if (!is_pushed) {
        is_pushed = true;
        idTimer = setInterval('move_all();', 50);
    }
}