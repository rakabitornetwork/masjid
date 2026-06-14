export const money = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export const date = (value, options = {}) => {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        ...options,
    }).format(new Date(value));
};

export const time = (value) => {
    if (!value) {
        return '-';
    }

    return String(value).slice(0, 5);
};

export const label = (value) =>
    String(value || '-')
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
