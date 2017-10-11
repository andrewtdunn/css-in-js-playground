import * as React from 'react';
import glamorous, { withTheme } from 'glamorous';
import { darken } from 'polished';
import kebabCase from 'lodash.kebabcase';
import queryString from 'query-string';
import InvertedIcon from 'react-icons/lib/go/light-bulb';
import DownIconElement from 'react-icons/lib/md/arrow-drop-down';

import Toolbar from './Toolbar';

import { Theme, ThemeProps, SANS_SERIF } from '../../style/';

const HeaderContainer = glamorous.header<ThemeProps>(
  {
    flex: '0 0 auto',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 0.5rem',
    zIndex: 2,
    transition: '250ms ease-in-out',
    position: 'relative'
  },
  ({ theme }) => ({
    backgroundColor: theme[theme.primary].base,
    borderBottom: `1px solid ${darken(0.1, theme[theme.primary].base)}`
  })
);

const SelectContainer = glamorous.div({
  display: 'flex',
  alignItems: 'center',
  position: 'relative'
});

const Select = glamorous.select<ThemeProps>(
  {
    height: 32,
    backgroundColor: 'transparent',
    border: 'none',
    boxShadow: 'none',
    appearance: 'none',
    fontSize: '1.3rem',
    paddingRight: '1.3rem'
  },
  SANS_SERIF,
  ({ theme }) => ({
    color: theme[theme.primary].text
  })
);

const DownIcon = (withTheme as any)(
  glamorous(DownIconElement)<
    {
      size: number;
    } & ThemeProps
  >(
    {
      position: 'absolute',
      right: '0',
      top: '50%',
      transform: `translateY(-50%)`
    },
    ({ theme }) => ({
      color: theme[theme.primary].text
    })
  )
);

const LightBulb = (withTheme as any)(
  glamorous(InvertedIcon)<ThemeProps>(
    {
      cursor: 'pointer'
    },
    ({ theme }) => ({
      color: theme[theme.primary].text
    })
  )
);

const IconContainer = glamorous.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end'
});

const Option = glamorous.option();

interface Props extends ThemeProps {
  activeModule: string;
  defaultLibrary: string;
  files: string[];
  primary: string;
  onActiveChange(active: string): any;
  onFileAdd(file: string): any;
  onSelect: Function;
  onColorSwitch?: Function;
  snippets: any;
}

interface State {
  selected: string;
}

export class Header extends React.Component<Props, State> {
  state = {
    selected: ''
  };

  componentDidMount() {
    const { library = this.props.defaultLibrary } = queryString.parse(
      location.search
    );
    const code = this.props.snippets[library];
    if (code) {
      this.setState({
        selected: library
      });
      this.props.onSelect({
        library,
        code
      });
    }
  }

  handleChange = ev => {
    const { value: library } = ev.target;
    const code = this.props.snippets[library];
    if (code) {
      this.setState({
        selected: library
      });
      const { theme, ...rest } = queryString.parse(location.search);
      this.augmentHistory({
        ...rest,
        library
      });
      this.props.onSelect({
        library,
        code
      });
    }
  };

  handleColorSwitch = () => {
    if (this.props.onColorSwitch) {
      const { primary } = this.props;
      const theme = primary === 'dark' ? 'light' : 'dark';
      const path = this.getPath({
        ...(queryString.parse(location.search) || {}),
        theme
      });
      history.replaceState({ path }, '', path);
      this.props.onColorSwitch(theme);
    }
  };

  augmentHistory(params) {
    const path = this.getPath(params);
    history.replaceState({ path }, '', path);
  }

  getPath(params) {
    return `${location.origin}${location.pathname}?${queryString.stringify(
      params
    )}`;
  }

  render() {
    const options = Object.keys(this.props.snippets);
    return (
      <glamorous.Div>
        <HeaderContainer>
          <SelectContainer>
            <Select value={this.state.selected} onChange={this.handleChange}>
              {options.map(option => (
                <Option key={option} value={option}>
                  {kebabCase(option)}
                </Option>
              ))}
            </Select>
            <DownIcon size={20} />
          </SelectContainer>
          <IconContainer>
            <LightBulb size={24} onClick={this.handleColorSwitch} />
          </IconContainer>
        </HeaderContainer>
        <Toolbar
          activeModule={this.props.activeModule}
          files={this.props.files}
          onActiveChange={this.props.onActiveChange}
          onFileAdd={this.props.onFileAdd}
        />
      </glamorous.Div>
    );
  }
}
