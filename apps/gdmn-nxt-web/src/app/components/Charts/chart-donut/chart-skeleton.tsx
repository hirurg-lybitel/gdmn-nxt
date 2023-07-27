import styles from './chart-skeleton.module.less';
import { Skeleton } from '@mui/material';

export default function ChartSkeleton() {
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ paddingLeft: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <Skeleton
            variant="text"
            height={'30px'}
            width={'135px'}
          />
        </div>
        <div style={{ display: 'flex', marginBottom: '35px', flexDirection: 'column' }}>
          <Skeleton
            variant="text"
            height={'30px'}
            width={'180px'}
            style={{ marginBottom: '5px' }}
          />
          <Skeleton
            variant="text"
            height={'30px'}
            width={'180px'}
            style={{ marginBottom: '5px' }}
          />
          <Skeleton
            variant="text"
            height={'30px'}
            width={'180px'}
            style={{ marginBottom: '5px' }}
          />
          <Skeleton
            variant="text"
            height={'30px'}
            width={'180px'}
            style={{ marginBottom: '5px' }}
          />
          <Skeleton
            variant="text"
            height={'30px'}
            width={'180px'}
            style={{ marginBottom: '5px' }}
          />
        </div>
      </div>
      <div className={styles['container']}>
        <div className={styles['square']}>
          <div className={styles['content']}>
            <div className={styles['body']}>
              <Skeleton
                variant="circular"
                height={'100%'}
                width={'auto'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
