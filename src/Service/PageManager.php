<?php

namespace Octave\CMSBundle\Service;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Octave\CMSBundle\Entity\Page;
use Octave\CMSBundle\Page\Type\PageTypeInterface;
use Octave\CMSBundle\Repository\PageRepository;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class PageManager
{
    /** @var array */
    private $types = [];

    /** @var array */
    private $textPageTemplates = [];

    /** @var bool|array */
    private $pages = false;

    /** @var PageRepository */
    private $repository;

    /** @var RequestStack */
    private $requestStack;

    /** @var AuthorizationCheckerInterface */
    private $authorizationChecker;

    /** @var array */
    private $deniedRoutes = [];

    /** @var array */
    private $routeOptions = [];

    /**
     * PageManager constructor.
     * @param PageRepository $repository
     * @param RequestStack $requestStack
     * @param AuthorizationCheckerInterface $authorizationChecker
     * @param $routeOptions
     */
    public function __construct(PageRepository $repository, RequestStack $requestStack,
                                AuthorizationCheckerInterface $authorizationChecker, $routeOptions)
    {
        $this->repository = $repository;
        $this->requestStack = $requestStack;
        $this->authorizationChecker = $authorizationChecker;
        $this->routeOptions = $routeOptions;
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
     * @param PageTypeInterface $type
     */
    public function addType($type)
    {
        $this->types[$type->getName()] = $type;
    }

    /**
     * @return array
     */
    public function getTextPageTemplates()
    {
        return $this->textPageTemplates;
    }

    /**
     * @param array $textPageTemplates
     */
    public function setTextPageTemplates($textPageTemplates)
    {
        $this->textPageTemplates = $textPageTemplates;
    }

    /**
     * @return array
     */
    public function getTextPageTemplatesAsChoices()
    {
        $choices = [];

        foreach ($this->textPageTemplates as $textPageTemplate) {
            $choices[$textPageTemplate['label']] = $textPageTemplate['path'];
        }

        return $choices;
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
                if (in_array($page->getName(), $this->deniedRoutes)) {
                    continue;
                }

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

        if ($this->pages === false) {
            $this->getPages();
        }

        return $this->pages[$routeName] ?? null;
    }

    /**
     * @return array
     */
    public function getAllowedPageTypes()
    {
        $types = $this->getTypes();
        $output = [];

        /** @var PageTypeInterface $type */
        foreach ($types as $type) {
            if (!$type->canCreateRole() || $this->authorizationChecker->isGranted($type->canCreateRole())) {
                $output[] = $type;
            }
        }

        return $output;
    }

    /**
     * @param $name
     * @return PageTypeInterface|null
     */
    public function getType($name)
    {
        return $this->types[$name] ?? null;
    }

    /**
     * @param array $deniedRoutes
     */
    public function setDeniedRoutes($deniedRoutes)
    {
        $this->deniedRoutes = $deniedRoutes;
    }

    /**
     * @return array
     */
    public function getDeniedRoutes()
    {
        return $this->deniedRoutes;
    }

    /**
     * @param $name
     * @return array
     */
    public function getRouteOptions($name)
    {
        return $this->routeOptions[$name] ?? [];
    }
}