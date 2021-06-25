import { updateNodeElement } from "../DOM";
import { arrified, createTaskQueue, createStateNode, getTag } from "../Misc";

const taskQueue = createTaskQueue();
let subTask = null;

// 等待被提交
let pendingCommit = null;

const commitAllWork = (fiber) => {
  fiber.effects.forEach((item) => {
    if (item.effectTag === "placement") {
      let fiber = item;
      let parentFiber = item.parent;
      while (
        parentFiber.tag === "class_component" ||
        parentFiber.tag === "function_component"
      ) {
        parentFiber = parentFiber.parent;
      }
      if (fiber.tag === "host_component") {
        parentFiber.stateNode.appendChild(item.stateNode);
      }
    } else if(item.effectTag === "update") {
      /**
       * 更新
       */
      if(item.type === item.alternate.type) {
        /**
         * 节点类型相同
         */
        updateNodeElement(item.stateNode, item, item.alternate)
      } else {
        /**
         * 节点类型不同
         */
        item.parent.stateNode.replaceChild(item.stateNode, item.alternate.stateNode)
      }
    }
    /***
     * 备份旧的fiber节点对象***/
    fiber.stateNode.__rootFiberContainer = fiber;
  });
};
const getFirstTask = () => {
  /**
   * 从任务队列中获取任务
   */
  const task = taskQueue.pop();
  /**
   * 返回最外层节点的fiber对象
   */
  return {
    props: task.props,
    stateNode: task.dom,
    tag: "host_root",
    effects: [],
    child: null,
    alternate: task.dom.__rootFiberContainer,
  };
};
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
  let prevFiber = null;
  let alternate = null;

  if (fiber.alternate && fiber.alternate.child) {
    alternate = fiber.alternate.child;
  }

  while (index < numberOfElements) {
    element = arrifiedChildren[index];
    if (element && alternate) {
      /**
       * 更新
       */
      newFiber = {
        type: element.type,
        props: element.props,
        tag: getTag(element),
        effects: [],
        effectTag: "update",
        stateNode: null,
        parent: fiber,
        alternate,
      };
      if (element.type === alternate.type) {
        /**
         * 类型相同
         */
        newFiber.stateNode = alternate.stateNode;
      } else {
        /**
         * 类型不同
         */
        newFiber.stateNode = createStateNode(newFiber);
      }

      newFiber.stateNode = createStateNode(newFiber);
    } else if (element && !alternate) {
      /**
       * 初始化渲染
       */
      newFiber = {
        type: element.type,
        props: element.props,
        tag: getTag(element),
        effects: [],
        effectTag: "placement",
        stateNode: null,
        parent: fiber,
      };

      newFiber.stateNode = createStateNode(newFiber);
    }

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevFiber.sibling = newFiber;
    }
    if (alternate && alternate.sibling) {
      alternate = alternate.sibling;
    } else {
      alternate = null;
    }
    prevFiber = newFiber;
    index++;
  }
};
const executeTask = (fiber) => {
  if (fiber.tag === "class_component") {
    reconcileChildren(fiber, fiber.stateNode.render());
  } else if (fiber.tag === "function_component") {
    reconcileChildren(fiber, fiber.stateNode(fiber.props));
  } else {
    reconcileChildren(fiber, fiber.props.children);
  }

  if (fiber.child) {
    return fiber.child;
  }

  let currentExecutedFiber = fiber;
  while (currentExecutedFiber.parent) {
    // 有同级返回同级
    currentExecutedFiber.parent.effects =
      currentExecutedFiber.parent.effects.concat(
        currentExecutedFiber.effects.concat([currentExecutedFiber])
      );
    if (currentExecutedFiber.sibling) {
      return currentExecutedFiber.sibling;
    }
    // 退到父级
    currentExecutedFiber = currentExecutedFiber.parent;
  }
  pendingCommit = currentExecutedFiber;
};

const workLoop = (deadline) => {
  if (!subTask) {
    subTask = getFirstTask();
  }

  // 如果任务存在就去执行这个任务
  /**
   * 如果任务存在并且浏览器有空余时间就调用
   * executeTask方法执行任务 接收任务返回新的任务
   */

  while (subTask && deadline.timeRemaining() > 1) {
    subTask = executeTask(subTask);
  }
};

// 调度任务
const performTask = (deadline) => {
  // 为什么加workLoop loop代表循环的意思，我们要把一个大的任务拆分成一个个小的任务，一个个小任务就需要采用循环的方式来调用，所以把这个方法命名为workLoop
  workLoop(deadline);
  if (subTask || !taskQueue.isEmpty) {
    requestIdleCallback(performTask);
  }

  if (pendingCommit) {
    commitAllWork(pendingCommit);
  }
};

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
    props: { children: element },
  });
  // performTask 执行任务的意思
  /**
   * 指定在浏览器空闲的时间去执行任务
   */
  requestIdleCallback(performTask);
};
