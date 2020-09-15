---
title: "怎样使用React Testing Library"
---

# Jest vs React Testing Library

React初学者经常混淆在React中进行测试的工具。React Testing库不是Jest的替代品，因为它们彼此需要，并且它们每一个都有明确的任务。

describe-block是测试套件，而test-block（也可以it代替命名test）是测试用例。一个测试套件可以具有多个测试用例，而一个测试用例不必位于一个测试套件中。放入测试用例中的内容称为断言（例如，expect在Jest中），证明是成功的（绿色）或错误的（红色）。这里有两个断言应该成功：

```javascript
describe('true is truthy and false is falsy', () => {
  test('true is truthy', () => {
    expect(true).toBe(true);
  });

  test('false is falsy', () => {
    expect(false).toBe(false);
  });
});
```

如果您使用的是create-react-app，则默认情况下Jest（和React Testing库）随安装一起提供。如果您使用自定义的React设置，则需要自己安装和设置Jest（和React Testing库）。

一旦通过Jest的测试运行程序`npm test`（或您在package.json中使用的任何脚本）运行测试，您将看到两个先前定义的测试的以下输出：

```text
 PASS  src/App.test.js
  true is truthy and false is falsy
    ✓ true is truthy (3ms)
    ✓ false is falsy

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        2.999s
Ran all test suites related to changed files.

Watch Usage
 › Press a to run all tests.
 › Press f to run only failed tests.
 › Press q to quit watch mode.
 › Press p to filter by a filename regex pattern.
 › Press t to filter by a test name regex pattern.
 › Press Enter to trigger a test run.
```

# React Testing Library: 渲染一个组件

如果您使用的是create-react-app，则默认情况下将存在React Testing库。如果您使用自定义的React设置（例如，React with Webpack）或其他React框架，则需要自己安装。

```javascript
import React from 'react';

const title = 'Hello React';

function App() {
  return <div>{title}</div>;
}

export default App;
```

```javascript
import React from 'react';
import { render } from '@testing-library/react';

import App from './App';

describe('App', () => {
  test('renders App component', () => {
    render(<App />);
  });
});
```

RTL的render函数可以对任何JSX进行渲染。之后，您应该可以在测试中访问React组件。为了使自己确信它已经存在，可以使用RTL的调试功能：

```javascript{2,10}
import React from 'react';
import { render, screen } from '@testing-library/react';

import App from './App';

describe('App', () => {
  test('renders App component', () => {
    render(<App />);

    screen.debug();
  });
});
```

```html
<body>
  <div>
    <div>
      Hello React
    </div>
  </div>
</body>
```

很棒的一点是，React Testing库并不在乎实际的组件。让我们来看一下以下利用不同React功能（useState，event handler，props）和概念（受控组件）的React 组件：

```javascript
import React from 'react';

function App() {
  const [search, setSearch] = React.useState('');

  function handleChange(event) {
    setSearch(event.target.value);
  }

  return (
    <div>
      <Search value={search} onChange={handleChange}>
        Search:
      </Search>

      <p>Searches for {search ? search : '...'}</p>
    </div>
  );
}

function Search({ value, onChange, children }) {
  return (
    <div>
      <label htmlFor="search">{children}</label>
      <input
        id="search"
        type="text"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export default App;
```

```html
<body>
  <div>
    <div>
      <div>
        <label
          for="search"
        >
          Search:
        </label>
        <input
          id="search"
          type="text"
          value=""
        />
      </div>
      <p>
        Searches for
        ...
      </p>
    </div>
  </div>
</body>
```

React Testing库用于像人类一样与您的React组件进行交互。人们看到的只是从React组件渲染的HTML，因此这就是为什么您将此HTML结构视为输出而不是两个单独的React组件的原因。

# React Testing Library: 选择元素

渲染了React组件之后，React Testing库为您提供了不同的搜索功能来抓取元素。这些元素然后用于断言或用户交互：

```javascript{10}
import React from 'react';
import { render, screen } from '@testing-library/react';

import App from './App';

describe('App', () => {
  test('renders App component', () => {
    render(<App />);

    screen.getByText('Search:');
  });
});
```

如果您真的不知道RTL渲染函数的渲染输出是什么，请始终使用RTL的调试函数。了解HTML结构之后，就可以开始使用RTL的屏幕对象功能选择元素。然后可以将所选元素用于用户交互或声明。我们将执行一个断言，检查该元素是否在DOM中：

```javascript{10}
import React from 'react';
import { render, screen } from '@testing-library/react';

import App from './App';

describe('App', () => {
  test('renders App component', () => {
    render(<App />);

    expect(screen.getByText('Search:')).toBeInTheDocument();
  });
});
```

如果该元素不能被发现，`getByText`默认会抛出一个错误。这有助于在编写测试时提示您首先需要编写所选元素。少数人利用此行为来作为搜索函数，例如getByText隐式断言替换，而不是使用的显式断言expect：

```javascript{10-13,15-17}
import React from 'react';
import { render, screen } from '@testing-library/react';

import App from './App';

describe('App', () => {
  test('renders App component', () => {
    render(<App />);

    // implicit assertion
    // because getByText would throw error
    // if element wouldn't be there
    screen.getByText('Search:');

    // explicit assertion
    // recommended
    expect(screen.getByText('Search:')).toBeInTheDocument();
  });
});
```

`getByText`函数接受一个字符串作为输入，就像我们现在正在使用的那样，它也可以接受一个正则表达式。字符串参数用于完全匹配，而正则表达式可用于部分匹配，这通常更方便：

```javascript{10-11,13-14,16-17}
import React from 'react';
import { render, screen } from '@testing-library/react';

import App from './App';

describe('App', () => {
  test('renders App component', () => {
    render(<App />);

    // fails
    expect(screen.getByText('Search')).toBeInTheDocument();

    // succeeds
    expect(screen.getByText('Search:')).toBeInTheDocument();

    // succeeds
    expect(screen.getByText(/Search/)).toBeInTheDocument();
  });
});
```

# React Testing Library: 搜索类型

您已经了解了`getByText`其中的`Text`是几个搜索类型之一。尽管`Text`通常是React Testing Library中选择元素的常用方法，但另一个强项是`Role`与`getByRole`。

`getByRole`函数通常用于通过aria-label属性检索元素。但是，HTML元素上也存在隐式角色 -例如按钮元素的按钮。因此，您不仅可以通过可见文本来选择元素，还可以通过React Testing库中的元素可访问性角色来选择元素。`getByText`和`getByRole`是RTL使用最广泛的搜索功能。

```javascript
import React from 'react';
import { render, screen } from '@testing-library/react';

import App from './App';

describe('App', () => {
  test('renders App component', () => {
    render(<App />);

    screen.getByRole('');
  });
});
```

这意味着先前的测试在运行后将以下内容输出到命令行：

```text
Unable to find an accessible element with the role ""

Here are the accessible roles:

document:

Name "":
<body />

--------------------------------------------------
textbox:

Name "Search:":
<input
  id="search"
  type="text"
  value=""
/>

--------------------------------------------------
```

由于HTML元素的隐式作用，我们至少有一个文本框（`<input />`）元素，可以使用以下搜索类型进行检索：

```javascript
import React from 'react';
import { render, screen } from '@testing-library/react';

import App from './App';

describe('App', () => {
  test('renders App component', () => {
    render(<App />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
```

为了进行测试，通常不必为HTML元素显式分配aria角色，因为DOM已经具有附加到HTML元素的隐式角色。

还有其他更特定于元素的搜索类型：

* **LabelText:** getByLabelText: `<label for="search" />`
* **PlaceholderText:** getByPlaceholderText: `<input placeholder="Search" />`
* **AltText:** getByAltText: `<img alt="profile" />`
* **DisplayValue:** getByDisplayValue: `<input value="JavaScript" />`

最后一种搜索类型为TestId，getByTestId需要data-testid在源ID的HTML中分配属性。

* getByText
* getByRole
* getByLabelText
* getByPlaceholderText
* getByAltText
* getByDisplayValue

同样，这些都是RTL中可用的所有不同搜索类型。

# React Testing Library: 搜索变体(Search Variants)

与搜索类型相反，还存在搜索变体。React Testing库中的搜索变体之一是getBy，它用于getByText或getByRole。这也是在测试React组件时默认使用的搜索变量。

其他两个搜索变体是queryBy和findBy；两者都可以通过getBy可以访问的相同搜索类型进行扩展。例如，queryBy及其所有搜索类型：

* queryByText
* queryByRole
* queryByLabelText
* queryByPlaceholderText
* queryByAltText
* queryByDisplayValue

而findBy及其所有搜索类型：

* findByText
* findByRole
* findByLabelText
* findByPlaceholderText
* findByAltText
* findByDisplayValue

## getBy和queryBy有什么区别？

何时使用getBy以及何时使用其他两个变体queryBy和findBy。您已经知道getBy返回一个元素或错误。getBy返回错误是一个方便的副作用，因为它可以确保作为开发人员的我们尽早注意到测试中存在错误。但是，这使得很难检查不应该存在的元素：

```javascript
import React from 'react';
import { render, screen } from '@testing-library/react';

import App from './App';

describe('App', () => {
  test('renders App component', () => {
    render(<App />);

    screen.debug();

    // fails
    expect(screen.getByText(/Searches for JavaScript/)).toBeNull();
  });
});
```

这是行不通的，因为即使调试输出显示不存在带有“ Searches for JavaScript”文本的元素，getBy也会在我们进行断言之前引发错误，因为它无法找到带有该文本的元素。为了声明不存在的元素，我们可以将getBy与queryBy交换：

```javascript
import React from 'react';
import { render, screen } from '@testing-library/react';

import App from './App';

describe('App', () => {
  test('renders App component', () => {
    render(<App />);

    expect(screen.queryByText(/Searches for JavaScript/)).toBeNull();
  });
});
```

因此，每当您断言某个元素不存在时，请使用queryBy。否则默认为getBy。那么findBy呢？

## 何时使用findBy？

findBy搜索变体用于最终将会出现的异步元素：

```javascript{1-3,7,9-16,24}
function getUser() {
  return Promise.resolve({ id: '1', name: 'Robin' });
}

function App() {
  const [search, setSearch] = React.useState('');
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      const user = await getUser();
      setUser(user);
    };

    loadUser();
  }, []);

  function handleChange(event) {
    setSearch(event.target.value);
  }

  return (
    <div>
      {user ? <p>Signed in as {user.name}</p> : null}

      <Search value={search} onChange={handleChange}>
        Search:
      </Search>

      <p>Searches for {search ? search : '...'}</p>
    </div>
  );
}
```

因为我们必须等待promise异步解析，这里必须编写异步测试。换句话说，在提取组件之后，我们必须等待用户在渲染一次之后进行渲染：

```javascript{7,10,12}
import React from 'react';
import { render, screen } from '@testing-library/react';

import App from './App';

describe('App', () => {
  test('renders App component', async () => {
    render(<App />);

    expect(screen.queryByText(/Signed in as/)).toBeNull();

    expect(await screen.findByText(/Signed in as/)).toBeInTheDocument();
  });
});
```

在其初始渲染之后，我们断言通过使用queryBy而不是getBy搜索变量，“Signed in as”文本不存在。然后，我们等待新的元素被发现，并且当异步返回并且组件再次重​​新渲染后，它将最终被发现。

```javascript{12,16}
import React from 'react';
import { render, screen } from '@testing-library/react';

import App from './App';

describe('App', () => {
  test('renders App component', async () => {
    render(<App />);

    expect(screen.queryByText(/Signed in as/)).toBeNull();

    screen.debug();

    expect(await screen.findByText(/Signed in as/)).toBeInTheDocument();

    screen.debug();
  });
});
```

对于尚不存在但最终将存在的任何元素，请使用findBy。如果断言缺少元素，请使用queryBy。否则默认为getBy。

## 多个元素呢？

您已经了解了三种搜索变体getBy，queryBy和findBy；所有这些都可以与搜索类型相关联（例如，文本，角色，PlaceholderText，DisplayValue）。如果所有这些搜索功能仅返回一个元素，那么如何断言是否存在多个元素（例如React组件中的列表）。所有搜索变体都可以使用All单词扩展：

* getAllBy
* queryAllBy
* findAllBy

它们都都返回一个元素数组，并且可以再次与搜索类型相关联。

## 断言函数

在先前的测试中，您使用了两个断言函数：toBeNull和toBeInTheDocument。两者都主要在React Testing Library中用于检查元素是否存在。

通常，所有这些断言函数都来自Jest。但是，React Testing库使用自己的断言函数（如toBeInTheDocument）扩展了此API。所有这些断言函数都包含在一个额外的程序包中，在使用create-react-app时已为您设置了这些程序包。

* toBeDisabled
* toBeEnabled
* toBeEmpty
* toBeEmptyDOMElement
* toBeInTheDocument
* toBeInvalid
* toBeRequired
* toBeValid
* toBeVisible
* toContainElement
* toContainHTML
* toHaveAttribute
* toHaveClass
* toHaveFocus
* toHaveFormValues
* toHaveStyle
* toHaveTextContent
* toHaveValue
* toHaveDisplayValue
* toBeChecked
* toBePartiallyChecked
* toHaveDescription

# React Testing Library: 触发事件

到目前为止，我们仅测试了是否使用getBy（和queryBy）在React组件中渲染（或不渲染）元素，以及重新渲染的React组件是否具有所需元素（findBy）。实际的用户交互如何？如果用户在输入字段中键入内容，则组件可能会重新呈现（例如在我们的示例中），并且应该显示（或在某处使用）新值。

我们可以使用RTL的fireEvent函数来模拟最终用户的交互。让我们看看这对我们的输入字段如何起作用：

```javascript{2,10,12-14,16}
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import App from './App';

describe('App', () => {
  test('renders App component', () => {
    render(<App />);

    screen.debug();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'JavaScript' },
    });

    screen.debug();
  });
});
```

fireEvent函数采用一个元素（此处为按文本框角色的输入字段）和一个事件（此处为值为“ JavaScript”的事件）。调试函数的输出应显示事件前后的HTML结构；并且您应该看到输入字段的新值已正确呈现。

另外，如果您的组件涉及异步任务（例如我们的App组件，因为它获取用户），您可能会看到以下警告：`Warning: An update to App inside a test was not wrapped in act(...).`。对我们来说，这意味着正在发生一些异步任务，我们需要确保我们的组件能够处理它。通常这可以使用RTL的act函数来完成，但是这次我们只需要等待用户解决：

```javascript{2,5-7}
describe('App', () => {
  test('renders App component', async () => {
    render(<App />);

    // wait for the user to resolve
    // needs only be used in our special case
    await screen.findByText(/Signed in as/);

    screen.debug();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'JavaScript' },
    });

    screen.debug();
  });
});
```

之后，我们可以在事件发生之前和之后进行断言：

```javascript{9,15}
describe('App', () => {
  test('renders App component', async () => {
    render(<App />);

    // wait for the user to resolve
    // needs only be used in our special case
    await screen.findByText(/Signed in as/);

    expect(screen.queryByText(/Searches for JavaScript/)).toBeNull();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'JavaScript' },
    });

    expect(screen.getByText(/Searches for JavaScript/)).toBeInTheDocument();
  });
});
```

## React Testing Library: 用户事件

React Testing Library带有扩展的用户事件库，该库建立在fireEvent API之上。以前，我们使用fireEvent触发用户交互。这次我们将使用userEvent作为替代，因为userEvent API比fireEvent API更接近于实际的浏览器行为。例如，fireEvent.change()仅触发了change事件而userEvent.type触发一个change事件，而且keyDown，keyPress和keyUp事件。

```javascript{2-3,16}
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from './App';

describe('App', () => {
  test('renders App component', async () => {
    render(<App />);

    // wait for the user to resolve
    await screen.findByText(/Signed in as/);

    expect(screen.queryByText(/Searches for JavaScript/)).toBeNull();

    await userEvent.type(screen.getByRole('textbox'), 'JavaScript');

    expect(
      screen.getByText(/Searches for JavaScript/)
    ).toBeInTheDocument();
  });
});
```

在使用React测试库时，请尽可能在fireEvent上使用userEvent。

# React Testing Library: Callback Handlers

Sometimes you will test React components in isolation as unit tests. Often these components will not have any side-effects or state, but only input (props) and output (JSX, callback handlers). We have already seen how we can test the rendered JSX given a component and props. Now we will test callback handlers for this Search component:

```javascript
function Search({ value, onChange, children }) {
  return (
    <div>
      <label htmlFor="search">{children}</label>
      <input
        id="search"
        type="text"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
```

All the rendering and asserting happens as before. However, this time we are using a utility from Jest to mock the `onChange` function which is passed to the component. Then, after triggering the user interaction on the input field, we can assert that the `onChange` callback function has been called:

```javascript
describe('Search', () => {
  test('calls the onChange callback handler', () => {
    const onChange = jest.fn();

    render(
      <Search value="" onChange={onChange}>
        Search:
      </Search>
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'JavaScript' },
    });

    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
```

Here again, we can see how userEvent matches the user behavior in the browser more closely as fireEvent. While fireEvent executes the change event by only calling the callback function once, userEvent triggers it for every key stroke:

```javascript{2,11,13}
describe('Search', () => {
  test('calls the onChange callback handler', async () => {
    const onChange = jest.fn();

    render(
      <Search value="" onChange={onChange}>
        Search:
      </Search>
    );

    await userEvent.type(screen.getByRole('textbox'), 'JavaScript');

    expect(onChange).toHaveBeenCalledTimes(10);
  });
});
```

Anyway, React Testing Library encourages you to test your React components not too much in isolation, but in integration (integration test) with other components. Only this way you can actually test whether state changes were applied in the DOM and whether side-effects took effect.

# React Testing Library: Asynchronous / Async

We have seen before how we can use async await when testing with React Testing Library in order to wait for certain elements to appear with the findBy search variant. Now we will go through a small example for testing data fetching in React. Let's take the following React component which uses axios for [fetching data](https://www.robinwieruch.de/react-fetching-data) from a remote API:

```javascript
import React from 'react';
import axios from 'axios';

const URL = 'http://hn.algolia.com/api/v1/search';

function App() {
  const [stories, setStories] = React.useState([]);
  const [error, setError] = React.useState(null);

  async function handleFetch(event) {
    let result;

    try {
      result = await axios.get(`${URL}?query=React`);

      setStories(result.data.hits);
    } catch (error) {
      setError(error);
    }
  }

  return (
    <div>
      <button type="button" onClick={handleFetch}>
        Fetch Stories
      </button>

      {error && <span>Something went wrong ...</span>}

      <ul>
        {stories.map((story) => (
          <li key={story.objectID}>
            <a href={story.url}>{story.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

On button click, we are fetching a list of stories from the [Hacker News API](https://hn.algolia.com/api). If everything goes right, we will see the list of stories rendered as list in React. If something goes wrong, we will see an error. The test for the App component would look like the following:

```javascript
import React from 'react';
import axios from 'axios';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from './App';

jest.mock('axios');

describe('App', () => {
  test('fetches stories from an API and displays them', async () => {
    const stories = [
      { objectID: '1', title: 'Hello' },
      { objectID: '2', title: 'React' },
    ];

    axios.get.mockImplementationOnce(() =>
      Promise.resolve({ data: { hits: stories } })
    );

    render(<App />);

    await userEvent.click(screen.getByRole('button'));

    const items = await screen.findAllByRole('listitem');

    expect(items).toHaveLength(2);
  });
});
```

Before we render the App component, we make sure that the API gets mocked. In our case, axios' return value from its `get` method gets mocked. However, if you are using another library or the browser's native fetch API for data fetching, you would have to mock these.

After mocking the API and rendering the component, we use the userEvent API to click to the button which leads us to the API request. Since the request is asynchronous, we have to wait for the component to update. As before, we are using RTL's findBy search variant to wait for element(s) which appear eventually.

```javascript{15-27}
import React from 'react';
import axios from 'axios';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from './App';

jest.mock('axios');

describe('App', () => {
  test('fetches stories from an API and displays them', async () => {
    ...
  });

  test('fetches stories from an API and fails', async () => {
    axios.get.mockImplementationOnce(() =>
      Promise.reject(new Error())
    );

    render(<App />);

    await userEvent.click(screen.getByRole('button'));

    const message = await screen.findByText(/Something went wrong/);

    expect(message).toBeInTheDocument();
  });
});
```

This last test shows you how to test an API request from your React component that fails. Instead of mocking the API with a promise that resolves successfully, we reject the promise with an error. After rendering the component and clicking the button, we wait for the error message to show up.

```javascript{3,17,19,25,27}
import React from 'react';
import axios from 'axios';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from './App';

jest.mock('axios');

describe('App', () => {
  test('fetches stories from an API and displays them', async () => {
    const stories = [
      { objectID: '1', title: 'Hello' },
      { objectID: '2', title: 'React' },
    ];

    const promise = Promise.resolve({ data: { hits: stories } });

    axios.get.mockImplementationOnce(() => promise);

    render(<App />);

    await userEvent.click(screen.getByRole('button'));

    await act(() => promise);

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  test('fetches stories from an API and fails', async () => {
    ...
  });
});
```

For the sake of completeness, this last test shows you how to await a promise in a more explicit way which also works if you don't want to wait for a HTML to show up.

After all, it's not too difficult to test async behavior in React with React Testing Library. You have to use Jest for mocking external modules (here remote API), and then just await data or re-renders of your React components in your tests.

<Divider />

React Testing Library is my go-to test library for React components. I have used Enzyme by Airbnb all the way before, but I like how React Testing Library moves you towards testing user behavior and not implementation details. You are testing whether your user can use your application by writing tests that resemble true user scenarios.