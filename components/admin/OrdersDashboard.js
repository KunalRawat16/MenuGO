"use client";

import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip, 
  IconButton, 
  Button,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress
} from "@mui/material";
import { ChevronDown, ChevronUp, RefreshCw, CheckCircle, Clock, XCircle, Play } from "lucide-react";

export default function OrdersDashboard({ restaurantId, slug }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      // The API now defaults to live orders if no status is specified
      const res = await fetch(`/api/orders?restaurantId=${restaurantId}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); // Increased to 15 seconds to reduce server load
    return () => clearInterval(interval);
  }, [restaurantId]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!confirm("Are you sure this order is completed and paid? It will be removed from the dashboard.")) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Preparing': return 'primary';
      case 'Served': return 'success';
      case 'Completed': return 'success';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock size={16} />;
      case 'Preparing': return <Play size={16} />;
      case 'Served': return <CheckCircle size={16} />;
      case 'Completed': return <CheckCircle size={16} />;
      case 'Cancelled': return <XCircle size={16} />;
      default: return null;
    }
  };

  if (loading && orders.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Live Orders</Typography>
        <Button 
          startIcon={<RefreshCw size={18} />} 
          onClick={fetchOrders}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Refresh
        </Button>
      </Box>

      {/* Desktop View - Hidden on mobile */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell />
                <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Table</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">No orders yet.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <React.Fragment key={order._id}>
                    <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                      <TableCell>
                        <IconButton size="small" onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}>
                          {expandedOrder === order._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>#{order._id.slice(-6).toUpperCase()}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{order.customerName}</TableCell>
                      <TableCell>
                        <Chip label={`Table ${order.tableNumber}`} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>₹{order.totalPrice}</TableCell>
                      <TableCell>
                        <Chip 
                          icon={getStatusIcon(order.status)}
                          label={order.status} 
                          color={getStatusColor(order.status)} 
                          size="small"
                          sx={{ fontWeight: 700, px: 1 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {order.status === 'Pending' && (
                            <Button 
                              variant="contained" 
                              size="small" 
                              onClick={() => updateStatus(order._id, 'Preparing')}
                              sx={{ borderRadius: 2 }}
                            >
                              Accept
                            </Button>
                          )}
                          {order.status === 'Preparing' && (
                            <Button 
                              variant="contained" 
                              size="small" 
                              color="success"
                              onClick={() => updateStatus(order._id, 'Served')}
                              sx={{ borderRadius: 2 }}
                            >
                              Ready
                            </Button>
                          )}
                          {order.status === 'Served' && (
                            <Button 
                              variant="contained" 
                              size="small" 
                              color="success"
                              onClick={() => updateStatus(order._id, 'Completed')}
                              sx={{ borderRadius: 2 }}
                            >
                              Done (Paid)
                            </Button>
                          )}
                          {order.status !== 'Served' && order.status !== 'Cancelled' && (
                            <Button 
                              variant="outlined" 
                              size="small" 
                              color="error"
                              onClick={() => deleteOrder(order._id)}
                              sx={{ borderRadius: 2 }}
                            >
                              Cancel
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                        <Collapse in={expandedOrder === order._id} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 2 }}>
                            <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 700 }}>
                              Order Details
                            </Typography>
                            <List disablePadding>
                              {order.items.map((item) => (
                                <ListItem key={item.id} sx={{ py: 1, px: 0 }}>
                                  <ListItemText 
                                    primary={`${item.name} x ${item.quantity}`} 
                                    secondary={item.category}
                                    slotProps={{ primary: { fontWeight: 600 } }}
                                  />
                                  <Typography sx={{ fontWeight: 700 }}>₹{item.price * item.quantity}</Typography>
                                </ListItem>
                              ))}
                              <Divider sx={{ my: 1 }} />
                              <ListItem sx={{ px: 0 }}>
                                <ListItemText primary="Grand Total" slotProps={{ primary: { fontWeight: 800 } }} />
                                <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>₹{order.totalPrice}</Typography>
                              </ListItem>
                            </List>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Mobile View - Shown on mobile only */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
        {orders.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 4, border: 1, borderColor: 'divider' }}>
            <Typography color="text.secondary">No orders yet.</Typography>
          </Box>
        ) : (
          orders.map((order) => (
            <Paper key={order._id} sx={{ p: 2, borderRadius: 4, border: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                    #{order._id.slice(-6).toUpperCase()}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{order.customerName}</Typography>
                  <Chip label={`Table ${order.tableNumber}`} size="small" variant="outlined" sx={{ mt: 0.5, fontWeight: 700 }} />
                </Box>
                <Chip 
                  label={order.status} 
                  color={getStatusColor(order.status)} 
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Box>

              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2, mb: 2 }}>
                {order.items.map((item) => (
                  <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.name} x {item.quantity}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{item.price * item.quantity}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Total</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>₹{order.totalPrice}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {order.status === 'Pending' && (
                  <Button 
                    fullWidth
                    variant="contained" 
                    onClick={() => updateStatus(order._id, 'Preparing')}
                    sx={{ borderRadius: 2, py: 1 }}
                  >
                    Accept Order
                  </Button>
                )}
                {order.status === 'Preparing' && (
                  <Button 
                    fullWidth
                    variant="contained" 
                    color="success"
                    onClick={() => updateStatus(order._id, 'Served')}
                    sx={{ borderRadius: 2, py: 1 }}
                  >
                    Ready / Served
                  </Button>
                )}
                {order.status === 'Served' && (
                  <Button 
                    fullWidth
                    variant="contained" 
                    color="success"
                    onClick={() => updateStatus(order._id, 'Completed')}
                    sx={{ borderRadius: 2, py: 1 }}
                  >
                    Done (Paid & Clear)
                  </Button>
                )}
                {order.status !== 'Served' && order.status !== 'Cancelled' && (
                  <Button 
                    fullWidth
                    variant="outlined" 
                    color="error"
                    onClick={() => deleteOrder(order._id)}
                    sx={{ borderRadius: 2, py: 1 }}
                  >
                    Cancel
                  </Button>
                )}
              </Box>
            </Paper>
          ))
        )}
      </Box>
    </Box>
  );
}


