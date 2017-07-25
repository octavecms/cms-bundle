<?php

namespace VideInfra\CMSBundle\Service;
use Symfony\Component\HttpFoundation\RequestStack;
use VideInfra\CMSBundle\Entity\Page;
use VideInfra\CMSBundle\Repository\PageRepository;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class PageManager
{
    /** @var array */
    private $types = [];

    /** @var bool|array */
    private $pages = false;

    /** @var PageRepository */
    private $repository;

    /** @var RequestStack */
    private $requestStack;

    /**
     * PageManager constructor.
     * @param PageRepository $repository
     * @param RequestStack $requestStack
     */
    public function __construct(PageRepository $repository, RequestStack $requestStack)
    {
        $this->repository = $repository;
        $this->requestStack = $requestStack;
    }

    /**
     * @return array
     */
    public function getTypes()
    {
        return $this->types;
    }

    /**
     * @param array $types
     */
    public function setTypes($types)
    {
        $this->types = $types;
    }

    /**
     * @param $type
     */
    public function addType($type)
    {
        $this->types[] = $type;
    }

    /**
     * @return array|bool
     */
    public function getPages()
    {
        if ($this->pages === false) {

            $pages = $this->repository->findActive();
            $this->pages = [];

            /** @var Page $page */
            foreach ($pages as $page) {
                $this->pages[$page->getName()] = $page;
            }
        }

        return $this->pages;
    }

    /**
     * @return mixed|null
     */
    public function getCurrentPage()
    {
        $routeName = $this->requestStack->getCurrentRequest()->get('_route');
        return $this->pages[$routeName] ?? null;
    }
}