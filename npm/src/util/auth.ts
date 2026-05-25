import { getLocalRepository } from "../repository/LocalDb"

const auths = ["立泉落落", "立泉"]

class Authority {
    checkSavedAuth(): boolean {
        const localAuth = getLocalRepository().getAuth()
        if (localAuth == null || localAuth == "") return false
        if (auths.includes(localAuth)) {
            return true
        } else {
            this.saveAuth("")
            return false
        }
    }

    saveAuth(auth: string) {
        getLocalRepository().saveAuth(auth)
    }

    checkInputAuth(auth: string): boolean {
        if (auths.includes(auth)) {
            this.saveAuth(auth)
            return true
        } else {
            return false
        }
    }
}

var authority: Authority | undefined

function initAuthority() {
    authority = new Authority()
}

export function getAuthority(): Authority {
    if (authority == null) {
        initAuthority()
    }
    return authority!!
}
