import { Button, IconButton, MenuItem, Modal, Select, Typography } from '@mui/material';
import styles from './update-list.module.less';
import { Box } from '@mui/system';
import React, { useState } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import CloseIcon from '@mui/icons-material/Close';

/* eslint-disable-next-line */


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50vw',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  height: '90vh',
  borderRadius: '20px'
};

export interface UpdateListProps {
  handleClose: () => void,
  open: boolean
}

interface content{
  head: string,
  text: string[]
}

interface Update {
  version: string,
  content: content[]
}

const initialUpdate: Update[] = [
  {
    version: '7.33',
    content: [
      { head: 'testHead1', text: ['testTddddddddddd ddddddddddddddddddddddddddddddddddddddddddddddd ddddddddddddddddddddddd ddddddddddddddext1_1dddddddd ddddddddddddddddd', 'testText1_2', 'testText1_3', 'testText1_4'] },
      { head: 'testHead2', text: ['testText2_1', 'testText2_2', 'testText2_3', 'testText2_4', 'testText2_5', 'testText2_6'] },
      { head: 'testHead3', text: ['testText3_1', 'testText3_2', 'testText3_3', 'testText3_4', 'testText3_5'] },
      { head: 'testHead4', text: ['testText4_1', 'testText4_2', 'testText4_3', 'testText4_4'] },
      { head: 'testHead5', text: ['testText5_1', 'testText5_2', 'testText5_3'] },
      { head: 'testHead6', text: ['testText6_1', 'testText6_2', 'testText6_3', 'testText6_4', 'testText6_5'] },
      { head: 'testHead7', text: ['testText7_1', 'testText7_2', 'testText7_3', 'testText7_4'] },
      { head: 'testHead8', text: ['testText8_1', 'testText8_2'] },
      { head: 'testHead9', text: ['testText9_1', 'testText9_2', 'testText9_3', 'testText9_4'] },
    ]
  },
  {
    version: '7.32a',
    content: [
      { head: 'testHead2', text: ['testText2_1', 'testText2_2', 'testText2_3', 'testText2_4', 'testText2_5', 'testText2_6'] },
      { head: 'testHead7', text: ['testText7_1', 'testTextfffffffffffffff7_2', 'testText7_3', 'testText7_4'] },
      { head: 'testHead8', text: ['testText8_1', 'testText8_2'] },
      { head: 'testHead9', text: ['testText9_1', 'testText9_2', 'testText9_3', 'testText9_4'] },

    ]
  },
  {
    version: '7.32',
    content: [
      { head: 'testHead6', text: ['testText6_1', 'testText6_2', 'testText6_3', 'testText6_4', 'testText6_5'] },
      { head: 'testHead7', text: ['testTedddddddddddddddxt7_1', 'testText7_2', 'testText7_3', 'testText7_4'] },
      { head: 'testHead8', text: ['testText8_1', 'testText8_2'] },
      { head: 'testHead9', text: ['testText9_1', 'testText9dddddddddd_2', 'testText9_3', 'testText9_4'] },

    ]
  }
];

export function UpdateList(props: UpdateListProps) {
  const { open, handleClose } = props;
  const [version, setVersion] = useState<string>('');
  const updates = initialUpdate.find(update => update.version === version) || initialUpdate[0];

  const handleChange = (e: any) => {
    setVersion(e.target.value);
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <IconButton
            style={{ position: 'absolute', top: 3, right: 5 }}
            onClick={handleClose}
            size="small"
            hidden
          >
            <CloseIcon />
          </IconButton>
          <PerfectScrollbar>
            <div style={{ paddingRight: '20px' }}>
              <Typography
                variant="h1"
                align="center"
              >

                <Select
                  value={updates.version}
                  onChange={handleChange}
                  displayEmpty
                >
                  {initialUpdate.map((update, index) =>
                    <MenuItem key={index} value={update.version}>
                      <h1 style={{ margin: '0px' }}>
                        <em>{update.version}</em>
                      </h1>
                    </MenuItem>
                  )}

                </Select>

              </Typography>

              {updates.content.map((content, index1) =>
                <>
                  <Typography
                    variant="h1"
                    key={index1}
                  >
                    <h2 style={{ margin: '0px' }}>
                      {content.head}
                    </h2>
                  </Typography>
                  <ul>
                    {content.text.map((text, index2) =>
                      <Typography
                        variant="h4"
                        key={index2}
                      >
                        <h3 style={{ margin: '0px' }}>
                          <li>
                            {text}
                          </li>
                        </h3>
                      </Typography>
                    )}
                  </ul>
                </>
              )}
            </div>
          </PerfectScrollbar>
        </Box>
      </Modal>
    </div>
  );
}

export default UpdateList;
