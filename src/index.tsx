import './index.sass'
import { h } from 'dom-chef'

const zoomEL = <div></div>
zoomEL.style.position = 'absolute'
zoomEL.style.background = 'black'
zoomEL.style.zIndex = '100'
document.body.appendChild(zoomEL)

const posEL = <div></div>
posEL.style.position = 'absolute'
posEL.style.background = 'black'
posEL.style.top = '20px'
posEL.style.zIndex = '100'
document.body.appendChild(posEL)

const debugEL = <div></div>
debugEL.style.position = 'absolute'
debugEL.style.background = 'black'
debugEL.style.top = '42px'
debugEL.style.zIndex = '100'
document.body.appendChild(debugEL)


const grid1 = <div className='grid'> </div>;
const grid2 = <div className='grid'> </div>;
const grid3 = <div className='grid'> </div>;

const nodes = <div className='node-parent'></div>;
document.body.appendChild(grid1)
document.body.appendChild(grid2)
document.body.appendChild(grid3)
document.body.appendChild(nodes)



let x = window.innerWidth / 2
let y = window.innerHeight / 2

let zoom = 1
let isDragging = false
let nodeDraggingId: undefined | NodeId = undefined

const MIN_ZOOM = 0.4
const MAX_ZOOM = 4
const ZOOM_LEVEL_1 = 0.5
const ZOOM_LEVEL_2 = 2


let id_counter = 0
type NodeId = number
const NODE_GRID: { [key: string]: NodeId | undefined } = {}
const NODES: { [key: NodeId]: Node } = {}
const GRID_SIZE = 50


for (let x = 0; x < 20; x++) {
  for (let y = 0; y < 10; y++) {
    addNode(x * GRID_SIZE * 5, y * GRID_SIZE, `${x}:${y}`)
    console.log(x * GRID_SIZE * 5, y * GRID_SIZE, toCssTranslate(x * GRID_SIZE * 5, y * GRID_SIZE,))
  }
}


updateViewport()
const LockCanvas = <canvas className='hidden-canvas'></canvas>
document.body.appendChild(LockCanvas)
window.addEventListener('mousedown', (e) => {
  e.preventDefault()
  LockCanvas.focus()
  LockCanvas.requestPointerLock()
  isDragging = true

})
window.addEventListener('mouseup', () => {
  isDragging = false
  nodeDraggingId = undefined
  document.exitPointerLock()
})

window.addEventListener('mousemove', (e) => {
  if (isDragging) {
    if (nodeDraggingId !== undefined) {

      const node = NODES[nodeDraggingId]
      node.x = (node.x + (e.movementX / zoom));
      node.y = (node.y + (e.movementY / zoom));


      node.el.style.transform = toCssTranslate(Math.ceil(node.x / GRID_SIZE) * GRID_SIZE, Math.ceil(node.y / GRID_SIZE) * GRID_SIZE)

    } else if (e.shiftKey) {

      x += e.movementX / 6;
      y += e.movementY / 6;

    } else {
      x += e.movementX;
      y += e.movementY;

    }
    updateViewport();
  }
})
window.addEventListener('wheel', (e) => {
  const old = zoom
  zoom = clamp(zoom * (Math.sign(e.deltaY) > 0 ? 0.9 : 1.1), MIN_ZOOM, MAX_ZOOM)

  const ratio = 1 - zoom / old

  x += (e.x - x) * ratio
  y += (e.y - y) * ratio

  updateViewport()
})



setGridOpacity(grid1, 0.3)
setGridOpacity(grid2, 0.05)
setGridOpacity(grid3, 0.6)
setGridOpacity(grid3, 0.6)


function updateViewport() {
  zoomEL.textContent = `zoom: ${zoom}`
  debugEL.textContent = JSON.stringify(NODE_GRID)
  posEL.textContent = `
  X: ${Math.round((window.innerWidth / 2) - x)}
  Y: ${Math.round((window.innerHeight / 2) - y)}`
  setGridSize(grid3, 10000)
  if (zoom < ZOOM_LEVEL_1) {
    setGridSize(grid1, 1000)
    setGridSize(grid2, 200)

    zoomEL.textContent += ' LEVEL 1'
  } else if (zoom < ZOOM_LEVEL_2) {
    setGridSize(grid1, 200)
    setGridSize(grid2, 50)
    zoomEL.textContent += ' LEVEL 2'

  } else {
    setGridSize(grid1, 50)
    setGridSize(grid2, 10)
    zoomEL.textContent += ' LEVEL 3'

  }

  grid1.style.backgroundPositionX = toPx(x);
  grid1.style.backgroundPositionY = toPx(y);

  grid2.style.backgroundPositionX = toPx(x);
  grid2.style.backgroundPositionY = toPx(y);

  grid3.style.backgroundPositionX = toPx(x);
  grid3.style.backgroundPositionY = toPx(y);


  nodes.style.transform = `${toCssTranslate(x, y)} scale(${zoom})`;
}

function clamp(number: number, min: number, max: number) {
  return Math.max(min, Math.min(number, max));
}


function setGridSize(grid: HTMLElement, size: number) {
  grid.style.backgroundSize = `${size * zoom}px ${size * zoom}px`
}
function setGridOpacity(grid: HTMLElement, amount: number) {
  grid.style.opacity = `${amount}`
}

interface Node {
  el: HTMLElement
  x: number
  y: number
  shape: NodeShape
  id: number
}


function addNode(x: number, y: number, name: string, shape: NodeShape = '1') {
  const nameEL = <span className='node-name'>{name}</span>

  const nodeEl = <div className='node'>

    {getNodeSvg(shape)}

    {nameEL}
    <span>AWD</span>
    <span>AWD</span>
    <span>AWD</span>
    <span>AWD</span>
    <span>AWD</span>
    <span>AWD</span>
  </div>

  nodeEl.style.transform = toCssTranslate(x, y)
  nodes.appendChild(nodeEl)

  const id = id_counter++
  const node: Node = { el: nodeEl, id: id, shape, x, y }
  NODES[id] = node

  const GridID = (x: number, y: number) => `${x},${y}`
  const XSlot = x / GRID_SIZE
  const YSlot = y / GRID_SIZE

  NODE_GRID[GridID(XSlot, YSlot)] = id
  NODE_GRID[GridID(XSlot + 1, YSlot)] = id
  NODE_GRID[GridID(XSlot + 2, YSlot)] = id
  NODE_GRID[GridID(XSlot + 3, YSlot)] = id


  nodeEl.onmousedown = (e) => {
    e.preventDefault()
    e.stopPropagation()
    LockCanvas.focus()
    LockCanvas.requestPointerLock()
    isDragging = true
    nodeDraggingId = id
  }

}

function toPx(val: string | number) {
  return `${val}px`
}
function toCssTranslate(x: number, y: number) {
  return `translate(${x}px, ${y}px)`
}
console.log(toCssTranslate(0, 0))
type NodeShape = '1' | '2' | '3'

function getNodeSvg(shape: NodeShape): Element {
  switch (shape) {
    case '1':
      return <svg className='node-svg' width="223" height="48" viewBox="0 0 223 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.82843 0.5H197.172C197.569 0.5 197.951 0.658036 198.232 0.93934L221.232 23.9393C221.818 24.5251 221.818 25.4749 221.232 26.0607L198.232 49.0607C197.951 49.342 197.569 49.5 197.172 49.5H2.82843C1.49207 49.5 0.82282 47.8843 1.76777 46.9393L21.9393 26.7678C22.9157 25.7915 22.9156 24.2085 21.9393 23.2322L1.76777 3.06066C0.82282 2.11571 1.49207 0.5 2.82843 0.5Z" fill="#2D3031" stroke="#AD5454" />
      </svg>


    case '2':

    case '3':
      return <svg className='node-svg' width="208" height="48" viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.82843 0.5H177.172C177.569 0.5 177.951 0.658035 178.232 0.93934L201.232 23.9393C201.818 24.5251 201.818 25.4749 201.232 26.0607L178.232 49.0607C177.951 49.342 177.569 49.5 177.172 49.5H2.82843C1.49207 49.5 0.82282 47.8843 1.76777 46.9393L21.9393 26.7678C22.9157 25.7915 22.9156 24.2085 21.9393 23.2322L1.76777 3.06066C0.82282 2.11571 1.49207 0.5 2.82843 0.5Z" fill="#2D3031" stroke="#AD5454" />
      </svg>

  }
}

const kFps = <span id="kFps"></span>
const kpFps = <progress id="kpFps" max={60}></progress>
//@ts-ignore
kpFps.min = 0
document.body.appendChild(<div style={{ top: '200px', position: 'absolute', background: 'black' }}>
  {kFps}
  {kpFps}

</div>)
let be = Date.now(), fps = 0;
requestAnimationFrame(
  function loop() {
    let now = Date.now()
    fps = Math.round(1000 / (now - be))
    be = now
    requestAnimationFrame(loop)
    if (fps < 35) {
      kFps.style.color = "red"
      kFps.textContent = fps + "FPS"
    } else if (fps >= 35 && fps <= 41) {
      kFps.style.color = "deepskyblue"
      kFps.textContent = fps + " FPS"
    } else {
      kFps.style.color = "white"
      kFps.textContent = fps + " FPS"
    }
    //@ts-ignore
    kpFps.value = fps
  }
)