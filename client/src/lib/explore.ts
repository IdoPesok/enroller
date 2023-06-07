export const addLinksToModelResponse = (response: string): string => {
  const courseCodeRegex = /[A-Z]{2,4} [0-9]{3}/g
  const courseCodes = response.match(courseCodeRegex)
  if (!courseCodes) return response

  const courseCodeToLink = (courseCode: string): string => {
    const [subject, number] = courseCode.split(" ")
    const tail = `/student/courses?p=${subject}&q=${number}`
    const fullUrl = window.location.origin + tail
    return `[${courseCode}](${fullUrl})`
  }

  courseCodes.forEach(courseCode => {
    const courseCodeRegex = new RegExp(courseCode, 'g')
    response = response.replace(courseCodeRegex, courseCodeToLink(courseCode))
  })

  return response
}
