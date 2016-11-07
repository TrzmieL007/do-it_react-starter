/**
 * Created by trzmiel007 on 12/10/16.
 */

function BarChart(options){
    var chartCanvas;
    var ctx;
    var margin = 64;
    var chartId = options.chartId || 'chartCanvas';
    var parentNode = options.parentNode || document.body;
    options = options || {};

    var stop = false;

    //*** defaults:
    var defaultCanvasWidth = options.width || 800;
    var defaultCanvasHeight = options.height || 600;
    var defaultColor = options.barColor || '#006600';
    var defaultFontSize = options.fontSize || 16;
    var defaultMinFontSize = options.smallestFont || 8;
    var defaultFontColor = options.fontColor || '#000000';
    var defaultHandleLongText = options.handleLongText || undefined;
    var defaultFloatPrecision = isNaN(parseInt(options.precision)) ? 100 : Math.pow(10,parseInt(options.precision));

    //*** Inner objects:
    var animation = {
        animate: options.animate || false,
        startAnimatingTime: null,
        desiredFrameRate: (options.animationLength || 512) / 60,
        running: false,
        paused: false,
        dynamicGraph: options.dynamicGraph || false
    };
    var regions;

    var doc = new Path2D("M8,16.5V17c1.691-2.578,3.6-3.953,6-4c0,1.045,0,2.838,0,3c0,0.551,0.511,1,1.143,1c0.364,0,0.675-0.158,0.883-0.391  C17.959,14.58,22,10.5,22,10.5s-4.041-4.082-5.975-6.137C15.817,4.158,15.507,4,15.143,4C14.511,4,14,4.447,14,5  c0,0.168,0,1.877,0,3C9.34,8,8,12.871,8,16.5z");
    var arrow = new Path2D("M5,21h14c0.553,0,1-0.448,1-1v-6.046c-0.664,0.676-1.364,1.393-2,2.047V19H6V7h7V5H5C4.447,5,4,5.448,4,6v14  C4,20.552,4.447,21,5,21z");
    function drawExportBt(){
        ctx.save();
        ctx.fillStyle = '#000000';
        ctx.fill(doc);
        ctx.fill(arrow);
        ctx.restore();
    }
    function hideExportBt(){
        ctx.clearRect(0,0,25,26);
    }

    //*** Private functions:
    function prepareCanvas(width, height){
        if(!chartCanvas && !document.getElementById(chartId)){
            chartCanvas = parentNode.appendChild(document.createElement('canvas'));
            chartCanvas.id = chartId;
            // chartCanvas.style.border = '1px solid black';
            regions = new Regions(chartCanvas);
            if(chartCanvas.getContext)
                ctx = chartCanvas.getContext('2d');
            else
                throw new Error('No canvas supported, sorry bro :/');
            var exportBt = regions.addClickableRegion(0,0,25,26,function(){
                exportPanel(width,height);
            });
        }else if(!document.getElementById(chartId)) throw new Error('no canvas found');
        chartCanvas.width = width;
        chartCanvas.height = height;
        ctx.clearRect(0,0,width,height);
        drawExportBt();
    }

    function drawBar(x,y,w,h,r){
        var b = (r && h > 12) || (r && w > 12) ? 1 : 0;
        ctx.shadowOffsetX = ctx.shadowOffsetY = b ? 1 : 0;
        ctx.shadowBlur = b ? 2 : 1;
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(x,y,w,h);
        ctx.shadowOffsetX = ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
        ctx.shadowColor = "rgba(0, 0, 0, 0)";
    }

    function writeText(text, x, y, maxWidth, font, options){
        try {
            text = text.toString();
            font = font || {};
            if(maxWidth < 4) return;
        }catch(e){
            return;
        }
        if(!text || font.fontSize < (font.minimumFontSize || defaultMinFontSize)) return;
        options = options || {};
        var fontSize = font.fontSize || defaultFontSize;
        var minFontSize = font.minimumFontSize || defaultMinFontSize;
        var textWidth = ctx.measureText(text);
        ctx.textAlign = font.textAlign || "center";
        ctx.textBaseline = font.baseline || "middle";
        ctx.font = fontSize+"px "+(font.font || 'serif');
        // console.groupCollapsed(text+', '+maxWidth+', '+fontSize);
        // console.log(textWidth.width);
        while(textWidth.width > maxWidth && fontSize > minFontSize) {
            ctx.font = (--fontSize) + "px serif";
            textWidth = ctx.measureText(text);
        }
        // console.log(ctx.font);
        // console.groupEnd();
        if(fontSize <= minFontSize && textWidth.width > maxWidth && (options.handleLongText || defaultHandleLongText)){
            switch(options.handleLongText || defaultHandleLongText){
                case 'ellipsis':
                    if(text.length < 3) return;
                    text = text.substr(0,text.length - 3).trim();
                    textWidth = ctx.measureText(text+'...');
                    while(textWidth.width > maxWidth){
                        text = text.substr(0,text.length - 1).trim();
                        textWidth = ctx.measureText(text+'...');
                    }
                    text += '...';
                    break;
                case 'hide':
                    text = text.substr(0,text.length - 1).trim();
                    textWidth = ctx.measureText(text);
                    while(textWidth.width > maxWidth){
                        text = text.substr(0,text.length - 1).trim();
                        textWidth = ctx.measureText(text);
                    }
                    break;
                case 'delete': return;
            }
        }
        ctx.fillStyle = font.color || defaultFontColor;
        if(options.rotate){
            ctx.save();
            ctx.translate(x,y);
            ctx.rotate((Math.PI/180)*options.rotate);
            if(options.background){
                ctx.save();
                ctx.fillStyle = options.background;
                ctx.fillRect(ctx.textAlign == 'center' ? textWidth.width / -2 : ctx.textAlign == 'right' ? textWidth.width : 0,
                    ctx.textBaseline == 'middle' ? fontSize / -2 : ctx.textBaseline !== 'top' ? -fontSize : 0,textWidth.width,fontSize);
                ctx.restore();
            }
            ctx.fillText(text,0,0);
            ctx.restore();
        }else {
            if(options.background){
                ctx.save();
                ctx.fillStyle = options.background;
                ctx.fillRect(x - (ctx.textAlign == 'center' ? textWidth.width / 2 : ctx.textAlign == 'right' ? textWidth.width : 0),
                    y - (ctx.textBaseline == 'middle' ? fontSize / 2 : ctx.textBaseline !== 'top' ? -fontSize : 0),textWidth.width,fontSize);
                ctx.restore();
            }
            ctx.fillText(text, x, y);
        }
        return { width: textWidth.width, rotate: options.rotate, fontSize };
    }

    function createGradient(x1,y1,x2,y2,color){
        if((x1 == x2 && Math.abs(y2-y1) < 8) || (y1 == y2 && Math.abs(x2-x1) < 8)) return color;
        var color2a = '#'+color.replace(/^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,"$1,$2,$3").split(',').map(function(c){
                return parseInt(c,16) + 64 > 255 ? 'ff' : ('0'+(parseInt(c,16) + 64).toString(16)).substr(-2);
            }).join('').substr(0,6);
        var color2b = '#'+color.replace(/^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,"$1,$2,$3").split(',').map(function(c){
                return parseInt(c,16) + 16 > 255 ? 'ff' : ('0'+(parseInt(c,16) + 16).toString(16)).substr(-2);
            }).join('').substr(0,6);
        var lingrad = ctx.createLinearGradient(x1,y1,x2,y2);
        try {
            lingrad.addColorStop(0, color2a);
            lingrad.addColorStop(0.16, color2b);
            lingrad.addColorStop(0.45, color);
            lingrad.addColorStop(0.55, color);
            lingrad.addColorStop(0.84, color2b);
            lingrad.addColorStop(1, color2a);
        }catch(e){
            console.log("color: %o, color2a: %o, color2b: %o",color,color2a,color2b);
        }
        return lingrad
    }

    function getOpositeColor(color){
        var rgb = color.replace(/^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,"$1,$2,$3").split(',').map(function(c){return parseInt(c,16);});
        if(rgb.every(function(c){ return c >108 && c < 144; })) return defaultFontColor;
        return '#'+rgb.map(function(c){ return ('0'+parseInt(255 - c).toString(16)).substr(-2); }).join('');
    }

    function getContrastColor(color){
        var rgb = color.replace(/^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,"$1,$2,$3").split(',').map(function(c){return parseInt(c,16);});
        var l = rgb.reduce(function(p,c){ return p+(c/255); },0) / 3;
        var diff = (-Math.pow(l-.5,2)+.75)*255;
        if(l > 0.5)
            return '#'+rgb.map(function(c){ return ('0'+Math.max(parseInt(c - diff),0).toString(16)).substr(-2); }).join('');
        return '#'+rgb.map(function(c){ return ('0'+Math.min(parseInt(c + diff),255).toString(16)).substr(-2); }).join('');
    }

    function drawBars(dane,X,Y,scaleF,barWidth,chartConfig,move,anim){
        var width = chartConfig.width || defaultCanvasWidth;
        ctx.clearRect(margin,margin/2,width - margin * 1.5, (chartConfig.height || defaultCanvasHeight) - margin * 1.5 - 1);
        var x = X, y = Y;
        if(anim){
            animation.running = true;
            animation.startAnimatingTime = +(new Date());
        }
        var rotate = chartConfig.rotate;
        var labels = chartConfig.labels || {};
        var animStep = animation.running ? 60 / Math.round((+(new Date()) - animation.startAnimatingTime) / animation.desiredFrameRate) : null;
        if(animStep && animStep <= 1){
            animation.running = false;
            if(animation.dynamicGraph){
                animation.paused = true;
            }else{
                animStep = animation.startAnimatingTime = null;
            }
        }
        var precision = chartConfig.floatPrecision || defaultFloatPrecision;
        dane.forEach(function(dana){
            var value = dana.value;
            if(animStep){
                value /= animStep;
            }
            if(precision) {
                value = Math.round(value * precision) / precision;
            }
            var yy = y - (rotate ? 0 : Math.ceil(scaleF * value));
            var w = rotate ? scaleF * value : barWidth;
            var h = rotate ? barWidth : y - yy;
            if (chartConfig.colorMinMax) {
                if (value == max) dana.color = chartConfig.colorMin || '#660000';
                if (value == minV) dana.color = chartConfig.colorMax || '#000099';
            }
            if (!dana.color) dana.color = defaultColor;
            ctx.fillStyle = createGradient(x, yy, rotate ? x : x + w, rotate ? yy + h : yy, dana.color);
            drawBar(x, yy, w, h, rotate);
            if(rotate){
                writeText(
                    value,
                    x + w + (labels.inside ? -5 : 2.5),
                    yy + h / 2,
                    labels.inside ? w - 10 : width - x + w + 2.5,
                    {
                        fontSize: barWidth > defaultFontSize + 2 ? defaultFontSize : labels.inside ? barWidth - 2 : barWidth,
                        color: labels.inside ? getContrastColor(dana.color) : dana.color,
                        textAlign: labels.inside ? 'right' : 'left'
                    },
                    {handleLongText: 'delete'}
                );
                y += move;
            }else{
                writeText(
                    value,
                    x + w / 2,
                    h > 12 ? yy - (labels.inside ? 0 : 2.5) : yy - 2.5,
                    w,
                    {
                        fontSize: 12,
                        color: h > 12 ? labels.inside ? getContrastColor(dana.color) : dana.color : dana.color,
                        baseline: h > 12 ? labels.inside ? 'top' : 'alphabetic' : 'alphabetic'
                    },
                    {handleLongText: 'delete'}
                );
                x += move;
            }
        });
        if(animStep)
            window.requestAnimationFrame(drawBars.bind(this, dane, X, Y, scaleF, barWidth, chartConfig, move, false));
    }

    function exportPanel(w,h){
        var mask = document.body.appendChild(document.createElement('div'));
        mask.style.position = 'fixed';
        mask.style.top = 0;
        mask.style.bottom = 0;
        mask.style.left = 0;
        mask.style.right = 0;
        mask.style.background = 'rgba(0,0,0,.64)';
        var panel = mask.appendChild(document.createElement('div'));
        panel.style.position = 'absolute    ';
        // panel.style.width = '128px';
        // panel.style.height = '128px';
        panel.style.fontWeight = 'bold';
        panel.style.padding = '1em';
        panel.style.background = '#ffffff';
        panel.style.borderRadius = '16px';
        panel.style.webkitBorderRadius = '16px';
        panel.style.mozBorderRadius = '16px';
        panel.style.left = '50%';
        panel.style.top = '50%';
        panel.style.textAlign = 'center';
        panel.innerHTML = 'Export chart to:<br/>';
        var png = panel.appendChild(document.createElement('button'));
        png.style.background = '#f1faff';
        png.style.border = '1px solid #0000aa';
        png.style.color = '#0000bc';
        png.style.borderRadius = '8px';
        png.style.webkitBorderRadius = '8px';
        png.style.mozBorderRadius = '8px';
        png.style.fontSize = '1.28em';
        png.style.padding = '.16em .32em';
        png.style.marginTop = '.5em';
        panel.appendChild(document.createElement('br'));
        var jpeg = panel.appendChild(png.cloneNode(true));
        png.innerText = 'PNG';
        jpeg.innerText = 'JPEG';
        png.addEventListener('click',function(){
            hideExportBt();
            var anchor = document.body.appendChild(document.createElement('a'));
            anchor.href = chartCanvas.toDataURL("image/png").replace("image/png","image/octet-stream");
            anchor.download = 'chart.png';
            anchor.click();
            drawExportBt();
            mask.click();
        });
        jpeg.addEventListener('click',function(){
            panel.innerHTML = 'Image quality:<br/>';
            var slider = panel.appendChild(document.createElement('input'));
            panel.appendChild(document.createElement('br'));
            slider.type = 'range';
            slider.min = 0;
            slider.max = 100;
            slider.value = 92;
            slider.style.margin = '8px';
            var label = panel.appendChild(document.createElement('label'));
            label.innerText = slider.value + '%';
            slider.oninput = function(){
                label.innerText = slider.value + '%';
            };
            panel.appendChild(document.createElement('br'));
            var submit = panel.appendChild(jpeg.cloneNode(false));
            submit.innerText = 'Gen JPEG';
            submit.onclick = function(){
                hideExportBt();
                var data = ctx.getImageData(0,0,w,h);
                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0,0,w,h);
                ctx.restore();
                var anchor = document.body.appendChild(document.createElement('a'));
                anchor.href = chartCanvas.toDataURL("image/jpeg",slider.value / 100).replace("image/jpeg","image/octet-stream");
                ctx.putImageData(data,0,0);
                anchor.download = 'chart.jpeg';
                anchor.click();
                drawExportBt();
                mask.click();
            };
            panel.style.marginTop = '-'+(panel.clientHeight / 2)+'px';
        });
        panel.style.marginLeft = '-'+(panel.clientWidth / 2)+'px';
        panel.style.marginTop = '-'+(panel.clientHeight / 2)+'px';
        mask.onclick = function(e){
            if(e.srcElement == mask)
                document.body.removeChild(mask);
        };
    }

    //*** Public functions:
    var drawChart = function drawChart(chartConfig){
        var width = chartConfig.width || defaultCanvasWidth;
        var height = chartConfig.height || defaultCanvasHeight;
        var rotate = chartConfig.rotate;
        var data = chartConfig.data;
        prepareCanvas(width,height);
        if(chartConfig.title) {
            writeText(chartConfig.title, width / 2, margin / 4, width - margin, { fontSize: margin / 4 }, { handleLongText: 'ellipsis' });
        }
        var min = 0;
        var minV;
        var max = 0;
        var barWidth = ((rotate ? height : width) - margin * 1.5) / (data.length * 1.16);
        data.forEach(function(dana){
            if(dana.value < min) min = dana.value;
            else if(dana.value > max) max = dana.value;
            if(typeof minV == 'undefined' || dana.value < minV) minV = dana.value;
        });
        var spread = max - min;
        if(!spread) spread = 1;
        var marginTop;
        var marginBottom;
        marginTop = Math.ceil(spread * .08);
        marginBottom = (min < 0) ? Math.ceil(marginTop * .666) : 0;
        var scaleF =  ((rotate ? width : height) - margin * 1.5) / (spread + marginBottom + marginTop);
        scaleF = Math.round(scaleF * 100) / 100;
        var xAxis = chartConfig.xAxis || {};
        var yAxis = chartConfig.yAxis || {};

        var x = margin + (rotate ? 0 : barWidth * .08), X = x;
        var y = rotate ? margin * .5 + barWidth * .08 : height - margin, Y = y;
        var space = rotate ? 32 : (yAxis.font ? yAxis.font.fontsize : defaultFontSize) + 2;
        var valJump = scaleF > space ? 1 : Math.round(space / scaleF);
        var labelMax = Math.ceil(((rotate ? width : height) - margin * 1.5) / scaleF);
        for(var i = valJump; i < labelMax; i += valJump){
            var jumpL = scaleF * i;
            var lx = Math.ceil(x + jumpL);
            var ly = Math.ceil(y - jumpL);
            ctx.beginPath();
            ctx.moveTo(rotate ? lx : margin - 2.5, rotate ? height - margin + 2.5 : ly);
            ctx.lineTo(rotate ? lx : margin - 5.5, rotate ? height - margin + 5.5 : ly);
            ctx.stroke();
            writeText(
                i,
                rotate ? lx : margin - 7.5,
                rotate ? height - margin + 7.5 : ly,
                rotate ? jumpL - 8 : margin - 15,
                {
                    textAlign: rotate ? 'center' : 'right',
                    baseline: rotate ? 'top' : 'middle'
                },
                { handleLongText: 'hide' }
            );
        }
        var labJump = rotate && barWidth > 21 ? 1 : Math.ceil(32/barWidth);
        var move = barWidth * 1.16;

        data.forEach(function(dana, index){
            var yy = y - (rotate ? 0 : Math.ceil(scaleF * dana.value));
            var w = rotate ? scaleF * dana.value : barWidth;
            var h = rotate ? barWidth : y - yy;
            if(rotate){
                if(!((data.length-index)%labJump)){
                    ctx.beginPath();
                    ctx.moveTo(x - 1, yy + h / 2);
                    ctx.lineTo(x - 3.5, yy + h / 2);
                    ctx.stroke();
                    writeText(
                        dana.label,
                        x - 5.5,
                        yy + h / 2,
                        margin - defaultFontSize - 4,
                        Object.assign({},{ textAlign: 'right' },yAxis.labels?yAxis.labels.font:{}),
                        Object.assign({},{ handleLongText: 'ellipsis' },yAxis.labels?yAxis.labels.options:{})
                    );
                }
                y += move;
            }else{
                if(!(index%labJump)){
                    ctx.beginPath();
                    ctx.moveTo(x + w / 2, height - margin + 1);
                    ctx.lineTo(x + w / 2, height - margin + 3.5);
                    ctx.stroke();
                    var labW = w * labJump;
                    var rot= {};
                    var ta = "center";
                    if(labW < margin - 16){
                        rot.rotate = 315;
                        labW = margin - 21;
                        ta = "right";
                    }
                    writeText(
                        dana.label,
                        x + w / 2,
                        height - margin + 5.5,
                        labW,
                        Object.assign({},{ textAlign: ta, baseline: 'top' },xAxis.labels?xAxis.labels:{}.font),
                        Object.assign({},{ handleLongText: 'ellipsis' },xAxis.labels?xAxis.labels.options:{},rot)
                    );
                }
                x += move;
            }
        });
        //// DRAW BARS ////
        drawBars(data,X,Y,scaleF,barWidth,chartConfig,move,animation.animate||chartConfig.animate);
        //// END  DRAW ////
        ctx.beginPath();
        ctx.moveTo(margin - (rotate ? 0 : 2.5), margin * .5 - (rotate ? 2.5 : 0));
        ctx.lineTo(margin - (rotate ? 0 : 2.5), height - margin + (rotate ? 5.5 : 2.5));
        ctx.moveTo(margin - (rotate ? 2.5 : 5.5), height - margin + (rotate ? 2.5 : 0));
        ctx.lineTo(width - margin * .5 + (rotate ? 0 : 2.5), height - margin + (rotate ? 2.5 : 0));
        ctx.stroke();
        writeText(xAxis.label, width / 2, height - margin / 4, width - margin * 2, null,{ background : '#ffffff' });
        writeText(yAxis.label, 0, height / 2, height - margin * 2, { baseline: 'top' },{ rotate: 270, background : '#ffffff' });
        //console.log("width: %o\nheight: %o\nmin: %o\nmax: %o\nbarWidth: %o\nspread: %o\nscaleF: %o",width,height,min,max,barWidth,spread,scaleF);
    };

    var test = function test() {
        drawChart({
            data: [
                {value:2},
                {value:10,color:'#660000'},
                {value:1},
                {value:4},
                {value:7},
                {value:3}
            ],
            title: "Test chart",
            width: 480,
            height: 320
        });
    };

    var random = function genRandomChart(n,rotate){
        var data = [];
        var labels = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday","Mo","Tu","We","Th","Fr","Sa","Su"];
        n = n || 10;
        for(var i = 0; i < n; ++i){
            data.push({
                value : parseInt(Math.random()*100)%64,
                color : parseInt(Math.random()*10) % 4 == 3 ? '#'+('000000'+(parseInt(Math.random() * 255*255*254).toString(16))).substr(-6) : null,
                label : labels[parseInt(Math.random() * labels.length)]
            });
        }
        drawChart({
            data: data,
            title: "Random data chart",
            labels: { inside : parseInt(Math.random()*10)%4 == 1 },
            xAxis: { label: 'X axis' },
            yAxis: { label: 'Y axis' },
            rotate: rotate
        });
    };

    //*** Internal tests functions:
    var div = document.createElement('div');
    div.style.width = '100px';
    div.style.height = '50px';
    div.style.display = 'inline-block';
    div.style.lineHeight = '50px';
    div.style.textAlign = 'center';
    var body = document.body;
    var internalTestFunctions = [
        function compareOpositeColors(color){
            var d = document.body.appendChild(document.createElement('div'));
            d.style.width = '200px';
            d.style.height = '50px';
            var c1 = d.appendChild(document.createElement('div'));
            c1.style.display = 'inline-block';
            c1.style.width = '50%';
            c1.style.height = '100%';
            var c2 = d.appendChild(c1.cloneNode(true));
            c1.style.background = color;
            c2.style.background = getOpositeColor(color);
        },
        function compareContrastColors(color){
            var d = div.cloneNode(div,true);
            d.style.background = color;
            d.style.color = getContrastColor(color);
            d.innerText = color;
            body.appendChild(d);
        },
        function drawAllContrasts(step){
            step = step || 32;
            for(var i = 0; i < 256; i += step){
                for(var j = 0; j < 256; j += step){
                    for(var k = 0; k < 256; k += step){
                        setTimeout(this[1].bind(null,'#'+('0'+i.toString(16)).substr(-2)+('0'+j.toString(16)).substr(-2)+('0'+k.toString(16)).substr(-2)),1);
                    }
                }
            }
        }
    ];

    return {
        drawChart : drawChart,
        test : test,
        testRandomData : random,
        internalTestFunctions : internalTestFunctions,

        // setters and getters
        // defaults
        setDefaultFontSize: function(x){ defaultFontSize = x; },
        getDefaultFontSize: function(){ return defaultFontSize; },
        setDefaultMinFontSize: function(x){ defaultMinFontSize = x; },
        getDefaultMinFontSize: function(){ return defaultMinFontSize; },
        setDefaultColor: function(x){ defaultColor = x; },
        getDefaultColor: function(){ return defaultColor; },
        setAnimate: function(x){ animation.animate = x; },
        getAnimate: function(){ return animation.animate; },
        setAnimationSpeed: function(x){ animation.desiredFrameRate = isNaN(parseInt(x)) ? 0 : parseInt(x) / 60; },
        getAnimationSpeed: function(){ return 60 * animation.desiredFrameRate; },
        getAnimationObject: function(){ return animation; }

        ,getRegions: function(){return regions;}
    }
}

function Regions(canvas,propagateClick){
    var regionsClickable = {};
    function getCtxPosition(){
        var tmp = canvas.getBoundingClientRect();
        return { x: tmp.left, y: tmp.top };
    }
    var ctxPos = getCtxPosition();
    function actualizeCTXpos(){
        ctxPos = getCtxPosition();
    }
    function isInRegion(region,x,y){
        return ctxPos.x + region.x < x && ctxPos.x + region.xEnd > x && ctxPos.y + region.y < y && ctxPos.y + region.yEnd > y;
    }
    canvas.addEventListener('click',function(e){
        actualizeCTXpos();
        if(propagateClick) {
            Object.keys(regionsClickable).forEach(function(key){
                if(!e.cancelBubble && isInRegion(regionsClickable[key], e.pageX, e.pageY)) {
                    regionsClickable[key].callback(e);
                }
            });
        }else{
            Object.keys(regionsClickable).some(function(key){
                return isInRegion(regionsClickable[key],e.pageX,e.pageY) ? (regionsClickable[key].callback(e),true) : false;
            });
        }
    });

    return {
        addClickableRegion: function(x,y,widht,height,callback){
            if(typeof callback != 'function' && (!x.callback || typeof x.callback != 'function')) return null;
            var id = Object.keys(regionsClickable).length;
            regionsClickable[id] = typeof x == 'object' ? x : {
                x: x,
                xEnd: x + widht,
                y: y,
                yEnd: y + height,
                callback: callback
            };
            return regionsClickable[id].id = id;
        },
        removeClickableRegion: function(id){
            delete regionsClickable[id];
        },
        getClickedRegions: function(mouseEvent){
            return Object.keys(regionsClickable).reduce(function(p,key){
                if(isInRegion(regionsClickable[key],mouseEvent.pageX,mouseEvent.pageY)){
                    p.push(key);
                }
                return p;
            },[]);
        }
        ,getClickableRegions: function(){
            return regionsClickable;
        }
    };
    // mouseEvent.pageX
    // mouseEvent.pageY
//     el.getBoundingClientRect() -> {
//         bottom: 161,
//         height: 34,
//         left: 88,
//         right: 631,
//         top: 12,
//         width: 543
//     }
}