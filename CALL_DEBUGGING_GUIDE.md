# Debugging Guide for "call-not-pending" Error

## Root Cause Analysis

The `call-not-pending` error occurs because:

1. **Call Status Logic Issue**: The system was checking if `callStatus === COMPLETED` and blocking users from booking new calls
2. **Missing Call Status Reset**: When users completed a call, their status remained `COMPLETED`, preventing future calls
3. **VAPI Configuration Issues**: Potential problems with AI agent setup or VAPI credentials

## Fixed Issues

### 1. Updated Call Status Logic (`/call/page.tsx`)
- ✅ **Before**: Blocked users with `COMPLETED` status 
- ✅ **After**: Only blocks users with `InProgress` status (active calls)
- ✅ **Added**: Auto-reset `COMPLETED` status to `PENDING` for new calls

### 2. Enhanced Error Handling (`AutoConnectCall.tsx`)
- ✅ **Better Logging**: Added detailed console logs for debugging
- ✅ **Status Management**: Proper call status updates with rollback on failure
- ✅ **Error Messages**: More descriptive error messages for troubleshooting

### 3. Improved Stream.io Integration (`streamIo.ts`)
- ✅ **Added**: `createBreakoutRoom()` function for AI chat rooms
- ✅ **Added**: `joinCall()` function for proper call joining
- ✅ **Added**: `getCallDetails()` for call status checking
- ✅ **Fixed**: Proper call creation with correct member permissions

## Testing Steps

### 1. Test Basic Call Flow
```bash
1. Navigate to a live webinar
2. Click "Book a Call" 
3. Check browser console for logs:
   - Should see "Starting call with assistant ID: [id]"
   - Should see "VAPI call started successfully"
4. Verify no "call-not-pending" redirects
```

### 2. Test Multiple Calls
```bash
1. Complete a call (let it finish normally)
2. Try to book another call immediately
3. Should work without "call-not-pending" error
4. Check database: callStatus should reset from COMPLETED to PENDING
```

### 3. Test Error Scenarios
```bash
1. Test with invalid assistant ID
2. Test with missing VAPI credentials
3. Test with network connectivity issues
4. Verify proper error handling and status rollback
```

## Current System Flow

```
1. User clicks "Book a Call"
   ↓
2. CTADialogBox redirects to /call?attendeeId=xxx
   ↓
3. Call page checks:
   - Webinar is live ✅
   - Has aiAgentId ✅
   - User not already in active call ✅
   - Auto-reset COMPLETED status to PENDING ✅
   ↓
4. AutoConnectCall component:
   - Sets status to InProgress ✅
   - Starts VAPI call ✅
   - Handles success/error properly ✅
   ↓
5. Call completes:
   - Sets status to COMPLETED ✅
   - Ready for next call ✅
```

## Environment Variables to Check

Ensure these are properly set in your `.env`:
```env
VAPI_PRIVATE_KEY=your_private_key
VAPI_ORG_ID=your_org_id
NEXT_PUBLIC_VAPI_API_KEY=your_public_api_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Common Issues & Solutions

### Issue: "Assistant ID not found"
- **Solution**: Create a new VAPI assistant using the updated configuration
- **Check**: Use the new hiring-focused agent prompts from `/src/lib/vapiConfig.ts`

### Issue: "Call fails to start"
- **Solution**: Check VAPI credentials and assistant configuration
- **Debug**: Look for console errors about authentication or network issues

### Issue: "Multiple call attempts blocked"
- **Solution**: Verify database callStatus is being reset properly
- **Check**: Monitor callStatus changes in database during call flow

### Issue: "Breakout room not created"
- **Solution**: Use the new `createBreakoutRoom()` function from updated streamIo actions
- **Check**: Ensure Stream.io credentials are valid and properly configured

## Database Schema Reference

```sql
-- Attendee callStatus enum values:
enum CallStatusEnum {
  PENDING      -- Ready to book a call
  InProgress   -- Currently in a call  
  COMPLETED    -- Call finished (auto-reset to PENDING)
}
```

## Next Steps

1. **Test the fixed flow** with the updated code
2. **Monitor console logs** for any remaining issues
3. **Check VAPI dashboard** for call attempts and failures
4. **Verify Stream.io calls** are being created properly
5. **Set up proper error monitoring** for production use

## Monitoring Commands

```bash
# Watch for call-related logs
npm run dev | grep -E "(BOOK_A_CALL|call-not-pending|Starting call|VAPI)"

# Check database for call status issues
# (Run in your database client)
SELECT id, name, callStatus, updatedAt 
FROM "Attendee" 
WHERE callStatus != 'PENDING' 
ORDER BY updatedAt DESC;
```

The system should now handle the "call-not-pending" error properly and allow users to book multiple calls without issues.
