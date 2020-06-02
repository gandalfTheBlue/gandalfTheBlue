---
title: 关于React渲染行为(绝大多数)的完整指南
date: '2020-06-22'
---

原文链接: [A (Mostly) Complete Guide to React Rendering Behavior](https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/)

*该文详细列举了React的渲染行为以及Context和React-Redux的使用是如何影响渲染的*

# 目录

# 什么是"渲染"?

**渲染**是React要求您的组件根据当前属性和状态来描述该组件希望其UI部分看起来是什么样子的过程。

## 渲染过程概览

在渲染过程中，React将从组件树的根开始，然后向下循环以查找被标记为需要更新的所有组件。 对于每个被标记的组件，React将调用`classComponentInstance.render()`(类组件)或`FunctionComponent()`(函数组件)，并保存渲染输出。

组件的渲染输出通常以JSX语法编写，然后在编译并准备部署JS时将其转换为`React.createElement()`调用。 `createElement`返回React元素，它们是描述UI结构的普通JS对象。 举例如下：

```jsx{6}
// 这里的JSX语法:
return <SomeComponent a={42} b="testing">Text here</SomeComponent>

// 被转换成了下面的调用:
return React.createElement(SomeComponent, {a: 42, b: "testing"}, "Text Here")

// 然后成为了下面的元素对象:
{type: SomeComponent, props: {a: 42, b: "testing"}, children: ["Text Here"]}
```

从整个组件树中收集了渲染输出之后，React将比较新旧对象树（通常称为“虚拟DOM”），并收集所有需要被应用到DOM的更新使得真实的DOM看起来更像当前所需的输出。 这里的差异计算过程(diff)称为“一致性比较”(Reconciliation)。

然后，React在一个同步更新中将所有计算出的更改应用于真实DOM。

## 渲染和提交阶段

React团队在概念上将这项工作分为两个阶段：

- “渲染阶段”包含渲染组件和计算更改的所有工作
- “提交阶段”是将这些更改应用于DOM的过程

React在提交阶段更新了DOM之后，它随后同步运行`componentDidMount`和`componentDidUpdate`类生命周期方法以及`useLayoutEffect` hooks。

然后，React设置一个短暂的timeout，并在超时后运行所有`useEffect` hooks。

您可以在[这张出色的React生命周期方法图](https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/)中看到类生命周期方法的可视化呈现。(目前没有展示`effect hooks`的运行时机，希望未来能够加上。)