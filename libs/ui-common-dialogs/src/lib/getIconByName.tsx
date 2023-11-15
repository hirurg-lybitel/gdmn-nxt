import * as icons from '@mui/icons-material'
interface IconByNameProps {
  name:string
}
export const IconByName = ({name}:IconByNameProps) => {
  const allIcons:any = icons
  const Icon = allIcons[`${name}`]
  if(!Icon) return <></>
  return <>
    <Icon/>
  </>
}
