<?php

namespace VideInfra\CMSBundle\PageType;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class BlockPageType extends BasePageType
{
    const TYPE = 'block';

    /**
     * @return string
     */
    public function getName()
    {
        return self::TYPE;
    }

    /**
     * @return string
     */
    public function getController()
    {
        return 'VideInfraCMSBundle:Block:edit';
    }

    /**
     * @return string
     */
    public function canCreateRole()
    {
        return 'ROLE_BLOCK_PAGE_CREATE';
    }
}