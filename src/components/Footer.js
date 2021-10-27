import React from 'react';

import { rhythm } from '../utils/typography';

class Footer extends React.Component {
  render() {
    return (
      <footer
        style={{
          marginTop: rhythm(2.5),
          paddingTop: rhythm(1),
        }}
      >
        <a
          href="https://github.com/gandalfTheBlue"
          target="_blank"
          rel="noopener noreferrer"
        >
          github
        </a>
        <div>蜀ICP备2021023940号</div>
      </footer>
    );
  }
}

export default Footer;
