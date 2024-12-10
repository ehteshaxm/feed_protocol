use borsh::BorshDeserialize;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    instruction::{AccountMeta, Instruction},
    msg,
    program::{get_return_data, invoke},
    pubkey::Pubkey,
};

entrypoint!(process_instruction);

#[derive(BorshDeserialize)]
pub struct RandomNumber {
    pub random_number: u64,
}

fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let mut accounts_iter = accounts.iter();

    let payer = next_account_info(&mut accounts_iter)?;
    let entropy_account = next_account_info(&mut accounts_iter)?;
    let fee_account = next_account_info(&mut accounts_iter)?;
    let rng_program = next_account_info(&mut accounts_iter)?;
    let system_program = next_account_info(&mut accounts_iter)?;
    let credits_account = next_account_info(&mut accounts_iter)?;

    let function_selector = instruction_data[0];

    let ix = Instruction {
        program_id: *rng_program.key,
        accounts: vec![
            AccountMeta::new(*payer.key, true),
            AccountMeta::new(*entropy_account.key, false),
            AccountMeta::new(*fee_account.key, false),
            AccountMeta::new_readonly(*system_program.key, false),
            AccountMeta::new(*credits_account.key, false),
        ],
        data: vec![100],
    };

    invoke(
        &ix,
        &[
            payer.clone(),
            entropy_account.clone(),
            fee_account.clone(),
            system_program.clone(),
            credits_account.clone(),
        ],
    )?;

    let returned_data = get_return_data().unwrap();
    if returned_data.0 != *rng_program.key {
        msg!("Unexpected return data");
        panic!();
    }

    let random_number: RandomNumber = RandomNumber::try_from_slice(&returned_data.1)?;
    msg!("Raw random number: {}", random_number.random_number);

    if function_selector == 1 {
        let bounded_number = (random_number.random_number % 5) + 1;
        msg!("Random number (1-5): {}", bounded_number);
    }

    else if function_selector == 2 {
        let random_lat = (random_number.random_number % 180) as f64 - 90.0;

        let random_lon = ((random_number.random_number / 180) % 360) as f64 - 180.0;

        msg!("Random coordinates: ({}, {})", random_lat, random_lon);
    }

    Ok(())
}