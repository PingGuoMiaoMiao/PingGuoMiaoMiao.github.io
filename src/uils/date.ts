export const convertDateFormat = (dateString: string) => {
    let date = new Date(dateString)

    let year = date.getFullYear()
    let month = ("0" + (date.getMonth() + 1)).slice(-2)
    let day = ("0" + date.getDate()).slice(-2)

    return year + "/" + month + "/" + day
}