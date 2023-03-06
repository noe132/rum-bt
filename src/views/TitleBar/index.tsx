import React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { shell, ipcRenderer } from 'electron';
import { MenuItem } from '@mui/material';
import { lang } from 'utils';
import { DropdownMenu } from 'components';
import { AllLanguages, i18n } from 'store';
import IconLangLocal from 'assets/lang_local.svg';

import './index.sass';

interface Props {
  className?: string
}

interface MenuItem {
  text: string
  action?: () => unknown
  children?: Array<MenuItem>
  hidden?: boolean
  icon?: string
  checked?: boolean
}

export const TitleBar = observer((props: Props) => {
  const menuLeft: Array<MenuItem> = [
    {
      text: 'Rum',
      children: [
        {
          text: lang.about,
          action: () => {
          },
        },
        {
          text: lang.exit,
          action: () => {
            ipcRenderer.send('quit');
          },
        },
      ],
    },
    {
      text: lang.help,
      children: [
        {
          text: lang.manual,
          action: () => {
            const url = i18n.state.lang === 'cn' ? 'https://guide.rumsystem.net/' : 'https://guide-en.rumsystem.net/';
            shell.openExternal(url);
          },
        },
        {
          text: lang.report,
          action: () => {
            shell.openExternal('https://github.com/rumsystem/rum-app/issues');
          },
        },
      ],
    },
  ].filter(<T extends unknown>(v: false | T): v is T => !!v);
  const menuRight: Array<MenuItem> = [
    {
      text: lang.switchLang,
      icon: IconLangLocal,
      children: [
        {
          text: 'English',
          checked: i18n.state.lang === 'en',
          classNames: 'pl-7',
          action: () => {
            i18n.switchLang('en' as AllLanguages);
          },
        },
        {
          text: '简体中文',
          checked: i18n.state.lang === 'cn',
          classNames: 'pl-7',
          action: () => {
            i18n.switchLang('cn' as AllLanguages);
          },
        },
      ],
    },
  ].filter(<T extends unknown>(v: false | T): v is T => !!v);

  return (<>
    <div
      className={classNames(
        props.className,
        'app-title-bar-placeholder',
      )}
    />

    <div
      className="menu-bar fixed left-0 right-0 bg-black text-white flex justify-between items-stretch px-2"
    >
      <div className="flex items-stertch">
        {menuLeft.map((menu, i) => (
          <DropdownMenu menu={menu} key={'menu-left-' + i} />
        ))}
      </div>
      <div className="flex items-stertch">
        {menuRight.map((menu, i) => (
          <DropdownMenu menu={menu} key={'menu-rigth-' + i} />
        ))}
      </div>
    </div>
  </>);
});
