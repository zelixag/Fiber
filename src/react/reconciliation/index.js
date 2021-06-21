import { createTaskQueue } from '../Misc'

const taskQueue = createTaskQueue();
const subTask = null

const getFirstTask = () => {}

const executeTask = fiber => {}

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

 console.log(taskQueue.pop())
 // performTask 执行任务的意思
 /**
  * 指定在浏览器空闲的时间去执行任务
  */
 requestIdleCallback(performTask)
}