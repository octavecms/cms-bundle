<?php

namespace VideInfra\CMSBundle\Routing;

use Symfony\Component\Config\Resource\SelfCheckingResourceInterface;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class EntityResource implements SelfCheckingResourceInterface, \Serializable
{
    private $resource;

    /**
     * EntityResource constructor.
     * @param $resource
     */
    public function __construct($resource)
    {
        $this->resource = $resource;
    }

    /**
     * @return string
     */
    public function serialize()
    {
        return serialize($this->resource);
    }

    /**
     * @param string $serialized
     */
    public function unserialize($serialized)
    {
        $this->resource = unserialize($serialized);
    }

    /**
     * @return mixed
     */
    public function __toString()
    {
        return $this->resource;
    }

    /**
     * @param int $timestamp
     * @return bool
     */
    public function isFresh($timestamp)
    {
        return false;
    }
}