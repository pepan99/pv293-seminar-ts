import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Post,
  Delete,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { Accounts } from './entities/accounts.entity';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateAccountDto } from './dto/zod-dtos';

@ApiTags('accounts')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Get('')
  @ApiResponse({ status: 200, description: 'Return all accounts' })
  findAll(): Promise<Accounts[]> {
    return this.accountsService.findAll();
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Return account by ID' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  findOne(@Param('id') id: string): Promise<Accounts | undefined> {
    return this.accountsService.findOne(id);
  }

  @Get('owner/:ownerId')
  @ApiResponse({ status: 200, description: 'Return accounts by owner ID' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findByOwnerId(@Param('ownerId') ownerId: string): Promise<Accounts[]> {
    return this.accountsService.findByOwnerId(ownerId);
  }

  @Post()
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  create(@Body() createAccountDto: CreateAccountDto): Promise<Accounts> {
    return this.accountsService.create(createAccountDto);
  }

  @Put(':id')
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  update(
    @Param('id') id: string,
    @Body() updateAccountDto: Partial<Accounts>,
  ): Promise<Accounts | undefined> {
    return this.accountsService.update(id, updateAccountDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.accountsService.remove(id);
  }
}
