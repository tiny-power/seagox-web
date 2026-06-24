const REQUIRED_KEYS = ['name', 'type', 'url', 'size']

export function parseAttachmentArray(value) {
    let data = value
    if (typeof value === 'string') {
        try {
            data = JSON.parse(value)
        } catch (error) {
            return []
        }
    }

    if (!Array.isArray(data)) return []
    return data
        .filter(item => {
            return (
                item &&
                typeof item === 'object' &&
                REQUIRED_KEYS.every(key => Object.prototype.hasOwnProperty.call(item, key)) &&
                typeof item.name === 'string' &&
                typeof item.type === 'string' &&
                item.type.indexOf('/') > 0 &&
                typeof item.url === 'string' &&
                typeof item.size === 'number' &&
                item.size >= 0
            )
        })
        .map(item => ({ name: item.name, type: item.type, url: item.url, size: item.size }))
}
