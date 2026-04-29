export const getStatusConfig = (status: string) => {
  switch (status) {
    case 'SUCCESS':
      return { color: '#10B981', bg: '#10B98112', label: 'Success' };
    case 'PENDING':
      return { color: '#F59E0B', bg: '#F59E0B12', label: 'Pending' };
    case 'FAILED':
      return { color: '#EF4444', bg: '#EF444412', label: 'Failed' };
    case 'REFUNDED':
      return { color: '#6B7280', bg: '#6B728012', label: 'Refunded' };
    default:
      return { color: '#6B7280', bg: '#6B728012', label: status };
  }
};
