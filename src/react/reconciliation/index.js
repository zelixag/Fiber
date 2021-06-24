import { arrified, createTaskQueue, createStateNode, getTag } from '../Misc'

const taskQueue = createTaskQueue();
let subTask = null

// 等待被提交
let pendingCommit = null

const commitAllWork = fiber => {
  fiber.effects.forEach((item) => {
    if(item.effectTag === "placement") {
      item.parent.stateNode.appendChild(item.stateNode)
    }
  })
}
const getFirstTask = () => {
  /**
   * 从任务队列中获取任务
   */
  const task = taskQueue.pop()
  /**
   * 返回最外层节点的fiber对象
   */
  return {
    props: task.props,
    stateNode: task.dom,
    tag: "host_root",
    effects: [],
    child: null
  }
}
const reconcileChildren = (fiber, children) => {
  /**
   * children 可能是对象，也有可能是数组
   * 将children转换成数组
   */
  const arrifiedChildren = arrified(children);
  let index = 0;
  let numberOfElements = arrifiedChildren.length;
  let element = null;
  let newFiber = null;
  let prevFiber = null

  while(index < numberOfElements) {
    element = arrifiedChildren[index];
    newFiber = {
      type: element.type,
      props: element.props,
      tag: getTag(element),
      effects: [],
      effectTag: "placement",
      stateNode: null,
      parent: fiber
    }

    newFiber.stateNode = createStateNode(newFiber)

    console.log(newFiber)

    if(index === 0) {
      fiber.child = newFiber;
    } else {
      prevFiber.sibling = newFiber
    }

    prevFiber = newFiber;
    index++
  }
}
const executeTask = fiber => {
  reconcileChildren(fiber, fiber.props.children)
  if(fiber.child) {
    return fiber.child
  }

  let currentExecutedFiber = fiber
  while(currentExecutedFiber.parent) {
    // 有同级返回同级
    currentExecutedFiber.parent.effects = currentExecutedFiber.parent.effects.concat(
      currentExecutedFiber.effects.concat([currentExecutedFiber])
    )
    if(currentExecutedFiber.sibling){
      return currentExecutedFiber.sibling
    }
    // 退到父级
    currentExecutedFiber = currentExecutedFiber.parent
  }
  pendingCommit = currentExecutedFiber
}

const workLoop = deadline => {
  if(!subTask) {
    subTask = getFirstTask()
  }

  // 如果任务存在就去执行这个任务
  /**
   * 如果任务存在并且浏览器有空余时间就调用
   * executeTask方法执行任务 接收任务返回新的任务
   */

  while(subTask && deadline.timeRemaining() > 1) {
    subTask = executeTask(subTask)
  }
}

// 调度任务
const performTask = deadline => {
  // 为什么加workLoop loop代表循环的意思，我们要把一个大的任务拆分成一个个小的任务，一个个小任务就需要采用循环的方式来调用，所以把这个方法命名为workLoop
  workLoop(deadline)
  if(subTask || !taskQueue.isEmpty) {
    requestIdleCallback(performTask)
  }

  if(pendingCommit){
    commitAllWork(pendingCommit)
  }
}

export const render = (element, dom) => {
  /**
   * 1. 向任务中添加任务
   * 2. 指定在浏览器空闲时执行任务
   * 
   * 
   */
  /**
   * 任务就是通过 vdom 对象 构建 fiber 对象
   * 
   * 
  */
 taskQueue.push({
   dom,
   props: {children: element}
 })
 // performTask 执行任务的意思
 /**
  * 指定在浏览器空闲的时间去执行任务
  */
 requestIdleCallback(performTask)
}