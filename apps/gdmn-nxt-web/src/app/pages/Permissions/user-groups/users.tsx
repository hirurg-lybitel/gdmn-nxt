interface IUsersProps{
  groupID?: number;
};

export function Users(props: IUsersProps) {
  const { groupID } = props;
  return <div>{`Группа ${groupID}`}</div>;
};
