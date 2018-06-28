
// var width, height
// var step = 0;
// var canvas = document.createElement('canvas')
// var ctx = canvas.getContext('2d')

// var bg = [13, 27, 34]


// var pt1 = {x:window.innerWidth*0.2, y:window.innerHeight*0.3}
// var pt2 = {x:window.innerWidth*0.8, y:window.innerHeight*0.7}
    
// window.addEventListener('resize', setup)

// setup()

// function setup() {
//   canvas.width = width = window.innerWidth
//   canvas.height = height = window.innerHeight
  
//   ctx.beginPath();
//   ctx.rect(0, 0, width, height)
//   ctx.fillStyle = `rgba(${bg[0]}, ${bg[1]}, ${bg[2]}, ${1})`
//   ctx.fill()
  
//   pt1 = {x:window.innerWidth*0.2, y:window.innerHeight*0.2}
//   pt2 = {x:window.innerWidth*0.8, y:window.innerHeight*0.8}
// }

// setInterval(animate, 60)

// function blur(ctx,canvas,amt) {
//   ctx.filter = `blur(${amt}px)`
//   ctx.drawImage(canvas, 0, 0)
//   ctx.filter = 'none'
// }

// function fade(ctx, amt, width, height) {
//   ctx.beginPath();
//   ctx.rect(0, 0, width, height)
//   ctx.fillStyle = `rgba(${bg[0]}, ${bg[1]}, ${bg[2]}, ${amt})`
//   ctx.fill()
// }

// function animate() {
//   step++
  
//   blur(ctx, canvas, 1)
//   draw()
//   fade(ctx, 0.17, width, height)
// }

// function draw () {
  
//   var iterations = [pt1, pt2]
//   var newiterations, i, j
//   for (i = 0; i < 8; i++) {
//     newiterations = [iterations[0]]
//     for(j = 1; j < iterations.length; j++) {
//       newiterations.push(getRandMidpoint(iterations[j-1], iterations[j], 200/(i*i+1)))
//       newiterations.push(iterations[j])
//     }
//     iterations = newiterations.concat([])
//   }
//   ctx.beginPath();
//   ctx.moveTo(iterations[0].x, iterations[0].y);
//   ctx.lineWidth = 1;
//   ctx.strokeStyle = '#d4e4fb';
//   ctx.strokeStyle = `hsla(${Math.sin( step / 30) * 120 + 50},${90}%,${70}%,1)`
//   for (i = 1; i < iterations.length; i++) {
//     ctx.lineTo(iterations[i].x, iterations[i].y);
//   }
//   ctx.stroke()
//   ctx.closePath()
// }

// function getRandMidpoint(pa, pb, range) {
//   var a = Math.atan2(pb.y-pa.y, pb.x-pa.x) + Math.PI/2
//   var half = {y:(pb.y-pa.y)/2 + pa.y, x:(pb.x-pa.x)/2 + pa.x}
//   var offset = Math.random() * range - range/2
//   var ho = {
//     x: Math.cos(a) * offset + half.x,
//     y: Math.sin(a) * offset + half.y
//   }
//   return ho
// }