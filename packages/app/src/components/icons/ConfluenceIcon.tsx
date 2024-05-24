import React from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  svg: {
    width: 'auto',
    height: 32,
  },
});

const ConfluenceIcon = () => {
  const classes = useStyles();

  return (
    <svg
      className={classes.svg}
      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <defs>
        <linearGradient id="confluence-original-a" gradientUnits="userSpaceOnUse" x1="26.791"
          y1="28.467" x2="11.792" y2="19.855" gradientTransform="scale(4)">
          <stop offset="0" stop-color="#0052cc" />
          <stop offset=".918" stop-color="#2380fb" />
          <stop offset="1" stop-color="#2684ff" />
        </linearGradient>
        <linearGradient id="confluence-original-b" gradientUnits="userSpaceOnUse" x1="5.209"
          y1="2.523" x2="20.208" y2="11.136" gradientTransform="scale(4)">
          <stop offset="0" stop-color="#0052cc" />
          <stop offset=".918" stop-color="#2380fb" />
          <stop offset="1" stop-color="#2684ff" />
        </linearGradient>
      </defs>
      <path
        d="M19.492 86.227a249.047 249.047 0 00-3.047 4.933c-.867 1.45-.433 3.336 1.016 4.207l19.863 12.188c1.45.87 3.332.433 4.203-1.016a139.349 139.349 0 012.899-4.934c7.832-12.91 15.804-11.46 30.011-4.64l19.72 9.281c1.593.727 3.335 0 4.058-1.45l9.426-21.323c.722-1.453 0-3.336-1.454-4.063-4.203-1.887-12.464-5.805-19.714-9.43-26.82-12.914-49.586-12.043-66.98 16.247zm0 0"
        fill="url(#confluence-original-a)" />
      <path
        d="M108.508 37.773a249.047 249.047 0 003.047-4.933c.87-1.45.433-3.336-1.016-4.207L90.676 16.445c-1.45-.87-3.332-.433-4.203 1.016a133.55 133.55 0 01-2.899 4.934c-7.832 12.91-15.804 11.46-30.011 4.64l-19.72-9.281c-1.593-.727-3.331 0-4.058 1.45l-9.422 21.323c-.726 1.453 0 3.34 1.45 4.063 4.203 1.887 12.468 5.805 19.714 9.43 26.825 12.77 49.586 12.042 66.98-16.247zm0 0"
        fill="url(#confluence-original-b)" />
    </svg>
  );
};

export default ConfluenceIcon;
