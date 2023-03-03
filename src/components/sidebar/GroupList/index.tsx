import { useEffect, useState, type ReactElement } from 'react'
import { useRouter } from 'next/router'
import Track from '@/components/common/Track'
import Link from 'next/link'
import SafeListItem from '../SafeListItem'
import Button from '@mui/material/Button'
import SvgIcon from '@mui/material/SvgIcon'
import AddIcon from '@/public/images/common/add.svg'
import css from './styles.module.css'
import useOwnedSafes from '@/hooks/useOwnedSafes'
import { OVERVIEW_EVENTS } from '@/services/analytics'

const GroupList = (): ReactElement => {
  const router = useRouter()
  const [groups, setGroups] = useState<any[]>([]);
  
  const ownedSafes = useOwnedSafes()
  console.log(ownedSafes);
  const [groupName, setGroupName] = useState<string | undefined>();

  useEffect(() => {
    const activeGroups = async () =>{
      const items = JSON.parse(localStorage.getItem('ricochet')!);
      console.log(items, 'items')
      if (items) {
       setGroups([...groups, items]);
      }
    }
    activeGroups()
    window.addEventListener('storage', activeGroups)
    console.log(groups, 'groups')
    return () => {  
      window.removeEventListener('storage', activeGroups)
    }
  }, []);

  const createGroup = async () => {
    console.log('groupname', groupName)
    localStorage.setItem(groupName!, JSON.stringify(ownedSafes));
    console.log(localStorage)
  }

  const nameGroup = (name: string) => {
    setGroupName(name)
  }

  return (
    <div className={css.container}>
       <div className={css.header}>
        <h3>
          My Groups
        </h3>
          <Track {...OVERVIEW_EVENTS.ADD_GROUP}>
            <div >
              <input type="text" value={groupName} onChange={(e) => nameGroup(e.target.value)}/>
              <Button
                disableElevation
                className={css.addbutton}
                size="small"
                variant="outlined"
                onClick={() =>  createGroup()}
                startIcon={<SvgIcon component={AddIcon} inheritViewBox fontSize="small" />}
              >
                Add
              </Button>
            </div>
          </Track>
      </div>
      <div>Ricochet</div>
      {groups?.map((group) => {
        return <SafeListItem
                  key={group}
                  address={group}
                  chainId={'137'}
                  closeDrawer={() => {}}
                  shouldScrollToSafe={false}
                />
      })}
    </div>
  )
}

export default GroupList
