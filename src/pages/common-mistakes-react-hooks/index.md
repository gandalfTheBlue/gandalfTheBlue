---
title: 2020年编写React组件(hooks)的五个常见错误
date: '2020-06-07'
---

原文链接: [Five common mistakes writing react components (with hooks) in 2020](https://www.lorenzweiss.de/common_mistakes_react_hooks/)

### `本文是关于我发现的编写React组件时最常见的错误，为什么它们是错误以及如何避免或修复它们。`

![](./fish.jpg)

# 作为框架的React

React出现在在Web开发领域已经有一段时间了，近年来它作为敏捷Web开发工具的地位稳步增强。 特别是在宣布并发布了新的[hook API/概念](https://reactjs.org/docs/hooks-state.html#hooks-and-function-components)之后，编写组件从未如此简单。

尽管React背后的团队和庞大的社区力量试图以令人印象深刻的方式培训和解释框架的概念，但我仍然看到使用该框架时遇到的一些陷阱和常见错误。 我记录了过去几年中我看到的所有与React相关的错误，尤其是React Hooks相关的。 在本文中，我想向您展示最常见的错误，并且还将尝试详细解释为什么我认为它们是错误，并提出了以更简洁的方式进行编码的建议。

## 免责声明

在我们开始之前，我必须说明下面列出的大多数事情都不是根本性的错误或者乍一看甚至看不出错误，而且大多数也不大可能影响应用的性能或外观。 除了从事该产品的开发人员外，也许没人会注意到这里有些问题，但是我仍然相信，高质量的代码可以带来更好的开发体验，从而带来更好的产品。

与任何软件框架或库一样，对一个问题总有数百万种不同的意见。 您在此处看到的所有内容都是基于我的个人观点，不应视为一般规则。 如果您对此有不同的看法，我洗耳恭听。🌟

# 1. 在不需要重新渲染的地方使用useState

React的核心概念之一是处理状态。 您可以通过状态控制整个数据流和渲染。 每次重新渲染树时，它很可能与状态变化有关。

通过`useState hook`，现在可以在函数组件中定义状态，这是一种在React中处理状态的非常整洁而简便的方法。 但正如我们在以下示例中看到的那样，它也可能被错误使用。

对于下一个示例，我们需要一些说明，假设我们有两个按钮，一个按钮是计数器，另一个按钮使用当前计数发送API请求或触发操作。 不过，当前计数永远不会在组件内展示。 仅当单击第二个按钮时才需要该计数来发送API请求。

### 这很危险 ❌

```jsx
function ClickButton(props) {
  const [count, setCount] = useState(0);

  const onClickCount = () => {
    setCount((c) => c + 1);
  };

  const onClickRequest = () => {
    apiCall(count);
  };

  return (
    <div>
      <button onClick={onClickCount}>Counter</button>
      <button onClick={onClickRequest}>Submit</button>
    </div>
  );
}
```

### 问题所在 ⚡

乍一看，您可能会问这到底有什么问题？ 不正是这样维护状态吗？是的您是对的，上面的代码可以正常地运行并且可能永远不会有问题，但是在React中，每次状态更改都会对该组件及其子组件进行重新渲染。但是在上面的示例中我们从未在组件渲染中使用该状态，所以每次设置计数器时都会导致不必要的渲染，这可能会影响性能或产生意外的副作用。

### 解决办法 ✅

如果要在组件内部使用一个变量，并且在不同的渲染中保持该变量的值，同时变量值的改变又不会强制组件重新渲染，则可以使用`useRef hook`。 它可以保持变量值，但不会强制重新渲染组件。
```jsx
function ClickButton(props) {
  const count = useRef(0);

  const onClickCount = () => {
    count.current++;
  };

  const onClickRequest = () => {
    apiCall(count.current);
  };

  return (
    <div>
      <button onClick={onClickCount}>Counter</button>
      <button onClick={onClickRequest}>Submit</button>
    </div>
  );
}
```

# 2. 使用router.push代替Link

这可能是一个简单以及非常容易发现的问题并且和React本身并没有真正的联系，但是当人们编写React组件时，我仍然常常发现这种写法。

假设创建一个按钮，单击该按钮用户将被重定向到另一个页面。 由于应用是SPA，所以该操作将是客户端路由机制。 因此我们将需要某种库来执行客户端路由操作。 在React生态中，最受欢迎的是路由库是react-router，下面的示例将使用该库。

所以只要添加点击事件回调就会将用户重定向到所需的页面，对吗？

### 这很危险 ❌

```jsx
function ClickButton(props) {
  const history = useHistory();

  const onClick = () => {
    history.push('/next-page');
  };

  return <button onClick={onClick}>Go to next page</button>;
}
```

### 问题所在 ⚡

即使上面的代码对于大多数用户来说都可以正常工作，但这里的可访问性(accessibility)仍然存在巨大的问题。 该按钮根本不会被标记为到另一个页面的链接，这使得屏幕阅读器几乎无法识别该按钮。 另外试试在新标签页或窗口中打开这个链接？ 很可能不会成功。

### 解决办法 ✅

与用户交互的跳转到其他页面的任何链接应尽可能由`<Link>`组件或常规的`<a>`标签处理。

```jsx
function ClickButton(props) {
  return (
    <Link to="/next-page">
      <span>Go to next page</span>
    </Link>
  );
}
```

**额外收获:**  代码更简洁，更具可读性。

# 3. 使用useEffect处理Actions

React引入的最好，思虑最周到的hook之一是"useEffect" hook。 它可以处理与`prop`或`state`变更相关的actions。 useEffect非常有用，但也经常在可能不需要它的地方被使用。

想象有一个组件，该组件会请求商品列表并将其渲染到dom。 另外，如果请求成功，将调用"onSuccess"函数。该函数作为`prop`传递给了该组件。

### 这很危险 ❌

```jsx
function DataList({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    callApi()
      .then((res) => setData(res))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!loading && !error && data) {
      onSuccess();
    }
  }, [loading, error, data, onSuccess]);

  return <div>Data: {data}</div>;
}
```

### 问题所在 ⚡

组件一共有两个useEffect hook，第一个在初次渲染时处理api调用，第二个在loading结束，没有错误并且状态中有数据的情况下调用onSuccess函数。这一定是一次成功的调用。 看起来很有道理吧？

可以肯定的是对于第一次调用这是没有问题的，并且可能永远不会失败。 但是，我们也失去了action和需要被调用的函数之间的直接联系。 另外我们不能100%保证在fetch操作成功后这种情况才会发生，而这正是我们开发人员所讨厌的。

### 解决办法 ✅

一个直接的解决方案是将"onSuccess"函数的调用设在fetch成功后的位置：

```jsx
function DataList({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    callApi()
      .then((fetchedData) => {
        setData(fetchedData);
        onSuccess();
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [onSuccess]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return <div>{data}</div>;
}
```

现在何时调用了onSuccess一目了然，确切地说是在api调用成功的情况下。

# 4. 单一职责的组件

构造组件有时候是困难的。 在什么时候应该将一个组件拆分为几个较小的组件呢？ 应该如何构造组件树呢？ 当我们使用基于组件的框架时，每天都会出现上述问题。 但是，设计组件时常见的错误是将两个用例组合到一个组件中。 让我们以标题为例，该标题在移动设备上显示汉堡按钮或在桌面web端显示标签。 （切换条件将由神奇的`isMobile`函数处理，这不是本示例的一部分🧙‍）

### 这很危险 ❌

```jsx
function Header(props) {
  return (
    <header>
      <HeaderInner menuItems={menuItems} />
    </header>
  );
}

function HeaderInner({ menuItems }) {
  return isMobile() ? <BurgerButton menuItems={menuItems} /> : <Tabs tabData={menuItems} />;
}
```

### 问题所在 ⚡

通过这种分支条件，HeaderInner组件试图同时处理两种不同的业务逻辑，我们都从[Jekyll](https://en.wikipedia.org/wiki/Strange_Case_of_Dr_Jekyll_and_Mr_Hyde)先生那里获悉，一心二用是不好的事情。 而且，这使得测试或在其他地方复用该组件变得更加困难。

### 解决办法 ✅

将分支条件往上提升一级，使得可以更轻松地展示组件的用途，并且它们仅负责一件事情，即`Header`只能是`Tab`或者`BurgerButton`，而不是尝试同时做两件事。

```jsx
function Header(props) {
  return (
    <header>{isMobile() ? <BurgerButton menuItems={menuItems} /> : <Tabs tabData={menuItems} />}</header>
  );
}
```

# 4. 单一职责的useEffects

还记得在hooks发布之前，我们只有通过`componentWillReceiveProps`或`componentDidUpdate`方法衔接到React组件的渲染过程中吗？ 对我来说这是黑暗的记忆同时也让我意识到使用`useEffect hook`的美妙之处，尤其是可以随意使用它们。

但是有时的粗心大意并让一个"useEffect"同时做几件事会带回那些黑暗的回忆。 例如，假设您有一个组件以某种方式从后端获取一些数据，并且还根据当前位置显示面包屑。 （再次使用`react-router`来获取当前位置。）

### 这很危险 ❌

```jsx
function Example(props) {
  const location = useLocation();

  const fetchData = useCallback(() => {
    /*  Calling the api */
  }, []);

  const updateBreadcrumbs = useCallback(() => {
    /* Updating the breadcrumbs*/
  }, []);

  useEffect(() => {
    fetchData();
    updateBreadcrumbs();
  }, [location.pathname, fetchData, updateBreadcrumbs]);

  return (
    <div>
      <BreadCrumbs />
    </div>
  );
}
```

### 问题所在 ⚡

这里有两个业务逻辑，即“数据获取”和“显示面包屑”。 两者都通过`useEffect`来进行更新。 当`fetchData`和`updateBreadcrumbs`函数或`location`更改时，将重新运行这个`useEffect hooks`。 现在的主要问题是，当`location`更改时，我们会重新调用`fetchData`函数。 这可能是我们没有想到的副作用。

### 解决办法 ✅

拆分`useEffect`可确保每个effect仅作用于单一的副作用，这可以使没有预料到的副作用不再出现。

```jsx
function Example(props) {
  const location = useLocation();

  const updateBreadcrumbs = useCallback(() => {
    /* Updating the breadcrumbs*/
  }, []);

  useEffect(() => {
    updateBreadcrumbs();
  }, [location.pathname, updateBreadcrumbs]);

  const fetchData = useCallback(() => {
    /*  Calling the api */
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div>
      <BreadCrumbs />
    </div>
  );
}
```

**额外收获:**  现在业务逻辑也在组件内被有序的分类排列了。

# 总结

在React中编写组件时有很多陷阱。 我们不可能百分百地了解整个运行机制并避免每一个小的甚至大的错误。 但是在学习框架或编程语言时犯错误也很重要，可能没有人会100％摆脱这些错误。

我认为与他人分享您的经验可能对其他人非常有帮助，或许可以帮助他们减少错误的发生。

如果您有任何疑问或认为这不是一个错误，请写信给我，我很想听听您的意见。