import { nfcTags } from '../db/schema';
import { NfcTagResponseDto } from './dto/nfc-tag-response.dto';

type NfcTagRow = typeof nfcTags.$inferSelect;

export function toNfcTagResponse(row: NfcTagRow): NfcTagResponseDto {
  const dto = new NfcTagResponseDto();
  dto.id = row.id;
  dto.tagCode = row.tagCode;
  dto.placeId = row.placeId;
  dto.status = row.status;
  dto.hardwareUid = row.hardwareUid;
  dto.ndefPayload = row.ndefPayload;
  dto.ndefType = row.ndefType;
  dto.techTypes = row.techTypes ?? null;
  dto.isWritable = row.isWritable;
  dto.maxSizeBytes = row.maxSizeBytes;
  dto.createdAt = row.createdAt;
  dto.updatedAt = row.updatedAt;
  return dto;
}
