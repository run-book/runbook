import { Condition, ConditionPathSection, ConditionPs, RootCondition, ValuePS, VariablePs } from "./condition";

import { ErrorsAnd } from "@runbook/utils";
import { foldNextChar, identifier, Token, lift, liftError, parserErrorMessage, mapParser, nextChar, parseCommaSeparated, Parser, ParserContext, ResultAndContext, tokenise } from "@dbpath/parser";


type ParserRes<R> = ResultAndContext<ParserContext, R>

const parseIsA = <C extends ConditionPathSection> ( p: C ): Parser<ParserContext, C> => ( c: ParserContext ): ParserRes<C> => {
  let parseIsA: Parser<ParserContext, C> = c => mapParser<ParserContext, string, C> ( nextChar ( c, ':' ), c =>
    mapParser ( identifier ( 'isA' ) ( c ), ( c, isa ) =>
      lift ( c, { ...p, isa } ) ) );
  return foldNextChar ( c, ':',
    parseIsA,
    c => lift ( c, p ) )
}
export function brackets<C extends ParserContext, R> ( c: C, open: string, parser: Parser<C, R>, close: string ): ResultAndContext<C, R> {
  return mapParser ( nextChar ( c, open ),
    c => mapParser ( parser ( c ), ( c, r ) => {
      return mapParser ( nextChar ( c, close ), c => lift ( c, r ) );
    } ) );
}

const parseVariable: Parser<ParserContext, VariablePs> = ( c: ParserContext ) => {
  return brackets ( c, '{',
    c => mapParser ( identifier ( 'variable' ) ( c ),
      ( c, variable ) => parseIsA ( { variable } ) ( c ) ),
    '}' )
};
const parseValue: Parser<ParserContext, ValuePS> = ( c: ParserContext ) => {
  return mapParser ( identifier ( 'value' ) ( c ), ( c, value ) =>
    foldNextChar<ParserContext, ValuePS> ( c, ':',
      parseIsA ( { value } ),
      c => lift ( c, { value } ) ) )
};

export const isNextCharIn = ( c: ParserContext, chs: string ): boolean => {
  let token: Token = c.tokens[ c.pos ];
  if ( !token ) return false;
  return chs.includes ( token.value )
}
export function nextCharIn<C extends ParserContext> ( chs: string ): Parser<C, string> {
  return ( c: C ) => {
    return isNextCharIn ( c, chs )
      ? lift ( c, c.tokens[ c.pos++ ].value )
      : liftError ( c, parserErrorMessage ( `Expected one of ${chs}.`, c, [] ) )
  }
}
export const parseConditionPs = <P extends ConditionPs> ( p: P ) => ( c: ParserContext ): ParserRes<P> => {
  if ( isNextCharIn ( c, '<>=' ) )
    return mapParser ( nextCharIn ( '<>=' ) ( c ), ( c, type ) =>
      mapParser ( identifier ( 'value' ) ( c ), ( c, value ) =>
        lift ( c, { ...p, condition: { type, value } } ) ) )
  return lift ( c, p )
}

export function parserConditionPathSection ( c: ParserContext ): ParserRes<ConditionPathSection> {
  return mapParser ( foldNextChar<ParserContext, ConditionPathSection> ( c, '{', parseVariable, parseValue ), ( c, ps ) =>
    parseConditionPs ( ps ) ( c ) )
}
export function parseRootCondition ( c: ParserContext ): ParserRes<RootCondition> {
  return mapParser ( parseCommaSeparated ( c, '.', parserConditionPathSection ), ( c, path ) =>
    lift ( c, { type: 'root', path } ) )
}
export function parseAndConditionOrRootCondition ( c: ParserContext ): ParserRes<Condition> {
  let parseCommaSeparated1 = parseCommaSeparated ( c, '&', parseRootCondition );
  return mapParser ( parseCommaSeparated1, ( c, conditions ) =>
    conditions.length === 1
      ? lift<ParserContext, Condition> ( c, conditions[ 0 ] )
      : lift ( c, { type: 'and', conditions } ) )
}
export function parseCondition ( condition: string ): ErrorsAnd<Condition> {
  const tokens = tokenise ( ":.<>={}&" ) ( condition )
  const errorTokens = tokens.filter ( t => t.type === 'error' )
  if ( errorTokens.length > 0 ) return { errors: [ 'sort out tokeniser issues' ] }
  const c: ParserContext = { pos: 0, tokens }
  const ast: ParserRes<Condition> = parseAndConditionOrRootCondition ( c )
  const { errors, context, result } = ast
  if ( errors?.length > 0 ) return { errors: parserErrorMessage ( condition, context, errors ) };
  if ( context.pos < tokens.length - 1 )
    return { errors: parserErrorMessage ( condition, context, [ "Expected end of condition" ] ) }
  return result
}