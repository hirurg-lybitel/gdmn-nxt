import { useGetUsersByGroupQuery } from '../../../features/permissions';

interface IUsersProps{
  groupID: number;
};

export function Users(props: IUsersProps) {
  const { groupID } = props;

  const { data: users, isFetching: usersFetching } = useGetUsersByGroupQuery(groupID);

  console.log('users', users);


  return <div>{`Группа ${groupID}`}</div>;
};
