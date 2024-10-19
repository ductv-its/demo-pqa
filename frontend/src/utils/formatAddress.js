function formatAddress(address, startLength = 6, endLength = 4) {
  if (!address || address.length <= startLength + endLength) {
    return address;
  }
  const start = address.slice(0, startLength);
  const end = address.slice(-endLength);
  return `${start}...${end}`;
}

export default formatAddress;
