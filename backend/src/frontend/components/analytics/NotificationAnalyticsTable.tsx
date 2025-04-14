import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AnalyticsData {
  notificationId: string;
  userId: string;
  deliveryStatus: 'sent' | 'delivered' | 'failed';
  deliveryTime: string;
  engagementStatus?: 'opened' | 'clicked' | 'ignored';
  engagementTime?: string;
  deviceInfo: {
    platform: string;
    osVersion: string;
    appVersion: string;
  };
  performanceMetrics: {
    deliveryTimeMs: number;
    processingTimeMs: number;
    retryCount: number;
  };
}

export const NotificationAnalyticsTable: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/analytics/notifications/user/${userId}?page=${page}&limit=${rowsPerPage}`
        );
        const result = await response.json();
        setData(result.data);
        setTotalCount(result.total);
      } catch (err) {
        setError(t('analytics.error.loading'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, rowsPerPage, t]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('analytics.table.notificationId')}</TableCell>
              <TableCell>{t('analytics.table.deliveryStatus')}</TableCell>
              <TableCell>{t('analytics.table.deliveryTime')}</TableCell>
              <TableCell>{t('analytics.table.engagementStatus')}</TableCell>
              <TableCell>{t('analytics.table.engagementTime')}</TableCell>
              <TableCell>{t('analytics.table.platform')}</TableCell>
              <TableCell>{t('analytics.table.deliveryTimeMs')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.notificationId}>
                <TableCell>{row.notificationId}</TableCell>
                <TableCell>{t(`analytics.status.${row.deliveryStatus}`)}</TableCell>
                <TableCell>
                  {format(new Date(row.deliveryTime), 'dd.MM.yyyy HH:mm:ss', { locale: cs })}
                </TableCell>
                <TableCell>
                  {row.engagementStatus
                    ? t(`analytics.status.${row.engagementStatus}`)
                    : '-'}
                </TableCell>
                <TableCell>
                  {row.engagementTime
                    ? format(new Date(row.engagementTime), 'dd.MM.yyyy HH:mm:ss', { locale: cs })
                    : '-'}
                </TableCell>
                <TableCell>{row.deviceInfo.platform}</TableCell>
                <TableCell>{(row.performanceMetrics.deliveryTimeMs / 1000).toFixed(2)}s</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={t('analytics.table.rowsPerPage')}
      />
    </Paper>
  );
}; 