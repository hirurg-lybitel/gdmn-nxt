import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import EditIcon from '@mui/icons-material/Edit';
import { IContactPerson, IPaginationData } from '@gsbelarus/util-api-types';
import styles from './contact-cards.module.less';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import { Avatar, Divider, IconButton, Stack, TablePagination, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { socialMediaIcons, socialMediaLinks } from '@gdmn-nxt/components/social-media-input';
import { CSSProperties, ChangeEvent, HTMLAttributes, useCallback, useEffect, useState } from 'react';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
import { useAddFavoriteMutation, useDeleteFavoriteMutation } from '../../../features/contact/contactApi';
import CustomNoData from '@gdmn-nxt/components/Styled/Icons/CustomNoData';

interface CardItemProps {
  contact: IContactPerson;
  onEditClick: (contact: IContactPerson) => void;
}
const CardItem = ({ contact, onEditClick }: CardItemProps) => {
  const [addFavorite] = useAddFavoriteMutation();
  const [deleteFavorite] = useDeleteFavoriteMutation();

  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleEditClick = useCallback((e: any) => {
    e.stopPropagation();
    onEditClick(contact);
  }, [contact, onEditClick]);

  const handleFavoriteClick = useCallback((e: any) => {
    e.stopPropagation();
    contact.isFavorite
      ? deleteFavorite(contact.ID)
      : addFavorite(contact.ID);
  }, [contact]);

  const handleStopPropagation = (e: any) => {
    e.stopPropagation();
  };


  return (
    <div
      className={`${styles['flip-card']} ${isFlipped ? styles['flipped'] : ''}`}
      onClick={handleClick}
    >
      <div className={styles.frontside}>
        <CustomizedCard
          className={styles.card}
        >
          <Stack direction="row" spacing={1}>
            <Avatar src={contact.PHOTO ?? ''} />
            <Stack style={{ overflow: 'hidden', paddingRight: '24px' }}>
              <Typography
                variant="body2"
                fontWeight={600}
                className={styles.contactName}
              >
                {contact.NAME}
              </Typography>
              <Typography variant="caption">{contact.RANK}</Typography>
            </Stack>
            <div
              className={styles.actions}
            >
              <IconButton
                size="small"
                onClick={handleEditClick}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </div>
          </Stack>
          <Typography
            variant="caption"
            my={'2px'}
            noWrap
          >
            {contact.COMPANY?.NAME ?? ''}
          </Typography>
          {
            Array.isArray(contact.PHONES) && contact.PHONES.length > 0 &&
            <Stack direction="row" spacing={1}>
              <PhoneIcon fontSize="small" color="primary" />
              <a
                className={styles.link}
                onClick={handleStopPropagation}
                href={`tel:${contact.PHONES[0].USR$PHONENUMBER.replace(/\s+/g, '')}`}
                rel="noreferrer"
                target="_blank"
              >
                <Typography variant="caption">{contact.PHONES[0]?.USR$PHONENUMBER}</Typography>
              </a>
            </Stack>
          }
          {
            Array.isArray(contact.EMAILS) && contact.EMAILS.length > 0 &&
            <Stack direction="row" spacing={1}>
              <EmailIcon fontSize="small" color="primary" />
              <a
                className={styles.link}
                onClick={handleStopPropagation}
                href={`mailto:${contact.EMAILS[0]?.EMAIL}`}
                rel="noreferrer"
                target="_blank"
              >
                <Typography variant="caption">{contact.EMAILS[0]?.EMAIL}</Typography>
              </a>
            </Stack>
          }
          {
            Array.isArray(contact.MESSENGERS) && contact.MESSENGERS.length > 0 &&
            <Stack direction="row" spacing={1}>
              <div className={styles['messenger-icon']}>
                <img
                  src={socialMediaIcons[contact.MESSENGERS[0]?.CODE]}
                  width={16}
                  height={16}
                />
              </div>
              <a
                className={`${styles.link} ${!socialMediaLinks[contact.MESSENGERS[0]?.CODE] ? styles.linkDisabled : ''}`}
                onClick={handleStopPropagation}
                href={`${socialMediaLinks[contact.MESSENGERS[0]?.CODE]}${contact.MESSENGERS[0]?.USERNAME}`}
                rel="noreferrer"
                target="_blank"
              >
                <Typography variant="caption">{contact.MESSENGERS[0]?.USERNAME}</Typography>
              </a>
            </Stack>
          }
          <Tooltip title={contact.isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}>
            <IconButton
              size="small"
              className={styles.chosenButton}
              onClick={handleFavoriteClick}
            >
              <StarIcon className={`${styles.selectedStar} ${contact.isFavorite ? '' : styles.starInvisible}`} />
              <StarBorderIcon className={`${styles.unselectedStar} ${!contact.isFavorite ? '' : styles.starInvisible}`} />
            </IconButton>
          </Tooltip>

        </CustomizedCard>
      </div>
      <div className={styles.backside}>
        <CustomizedCard
          className={styles.card}
          style={{
            overflowY: 'auto',
          }}
        >
          <div
            className={styles.actions}
            // hidden
          >
            <IconButton
              size="small"
              // disabled={addIsFetching}
              onClick={handleEditClick}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </div>
          <Stack spacing={1}>
            <div>
              {contact.PHONES?.map(phone =>
                <Stack
                  key={phone.ID}
                  direction="row"
                  spacing={1}
                >
                  <PhoneIcon fontSize="small" color="primary" />
                  <a
                    className={styles.link}
                    onClick={handleStopPropagation}
                    href={`tel:${phone.USR$PHONENUMBER.replace(/\s+/g, '')}`}
                  >
                    <Typography variant="caption">{phone.USR$PHONENUMBER}</Typography>
                  </a>
                </Stack>)}
            </div>
            <div>
              {contact.EMAILS?.map(email =>
                <Stack
                  key={email.ID}
                  direction="row"
                  spacing={1}
                >
                  <EmailIcon fontSize="small" color="primary" />
                  <a
                    className={styles.link}
                    onClick={handleStopPropagation}
                    href={`mailto:${email.EMAIL}`}
                  >
                    <Typography variant="caption">{email.EMAIL}</Typography>
                  </a>
                </Stack>)}
            </div>
            <div>
              {contact.MESSENGERS?.map(mes =>
                <Stack
                  key={mes.ID}
                  direction="row"
                  spacing={1}
                >
                  <div className={styles['messenger-icon']}>
                    <img
                      src={socialMediaIcons[mes.CODE]}
                      width={16}
                      height={16}
                    />
                  </div>
                  <a
                    className={`${styles.link} ${!socialMediaLinks[mes.CODE] ? styles.linkDisabled : ''}`}
                    onClick={handleStopPropagation}
                    href={`${socialMediaLinks[mes.CODE]}${mes.USERNAME}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Typography variant="caption">{mes.USERNAME}</Typography>
                  </a>
                </Stack>)}
            </div>
          </Stack>
        </CustomizedCard>
      </div>
    </div>
  );
};

export interface ContactCardsProps {
  contacts?: IContactPerson[];
  contactsCount?: number;
  onEditClick: (contact: IContactPerson) => void;
  paginationData: IPaginationData;
  paginationClick: (data: IPaginationData) => void;
}

export function ContactCards({
  contacts,
  contactsCount = 0,
  onEditClick,
  paginationData,
  paginationClick,
}: ContactCardsProps) {
  const [pageOptions, setPageOptions] = useState<number[]>([]);
  const theme = useTheme();
  const matchUpUW = useMediaQuery(theme.breakpoints.up('ultraWide'));

  useEffect(() => {
    const rowPerPage = matchUpUW ? 25 : 12;
    setPageOptions([
      rowPerPage,
      rowPerPage * 2,
      rowPerPage * 5,
      rowPerPage * 10
    ]);
  }, [paginationData, matchUpUW]);

  const handleClick = (contact: IContactPerson) => {
    onEditClick(contact);
  };

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    paginationClick({ pageNo: 0, pageSize: parseInt(event.target.value, 10) });
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    paginationClick({ ...paginationData, pageNo: newPage });
  };

  return (
    <div className={`container ${styles['container']}`}>
      {contacts?.length === 0
        ? <div className={styles.noData}><CustomNoData /></div>
        : <>
          <CustomizedScrollBox>
            <ul className={`list ${styles.list}`}>
              {contacts?.map((contact) =>
                <li key={contact.ID} className={styles.item}>
                  <CardItem contact={contact} onEditClick={handleClick} />
                </li>
              )}
            </ul>
          </CustomizedScrollBox>
          <Divider />
          <div className={styles.footer}>
            <TablePagination
              component="div"
              labelRowsPerPage="Карточек на странице:"
              count={contactsCount}
              page={paginationData.pageNo}
              rowsPerPageOptions={pageOptions}
              rowsPerPage={paginationData.pageSize}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        </>
      }


    </div>
  );
}

export default ContactCards;
