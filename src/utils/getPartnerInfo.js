

const getPartnerInfo = (participatnts, loggedinEmail) => {
    return participatnts.find(participatnt => participatnt.email !== loggedinEmail)
}

export default getPartnerInfo